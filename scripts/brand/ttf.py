"""Minimal TrueType reader: cmap(4/12) + loca/glyf (simple + composite) + hmtx + kern via GPOS pair pos (format 1/2)."""
import struct
class TTF:
    def __init__(s,path):
        d=open(path,"rb").read(); s.d=d
        n=struct.unpack(">H",d[4:6])[0]; s.t={}
        for i in range(n):
            tag,_,off,ln=struct.unpack(">4sIII",d[12+16*i:28+16*i]); s.t[tag.decode()]=(off,ln)
        assert "glyf" in s.t, "CFF font — not supported"
        h=s.t["head"][0]; s.upm=struct.unpack(">H",d[h+18:h+20])[0]; s.locfmt=struct.unpack(">h",d[h+50:h+52])[0]
        m=s.t["maxp"][0]; s.ng=struct.unpack(">H",d[m+4:m+6])[0]
        hh=s.t["hhea"][0]; s.nhm=struct.unpack(">H",d[hh+34:hh+36])[0]
        s.asc,s.desc=struct.unpack(">hh",d[hh+4:hh+8])
        l=s.t["loca"][0]; s.loca=[(struct.unpack(">H",d[l+2*i:l+2*i+2])[0]*2 if s.locfmt==0 else struct.unpack(">I",d[l+4*i:l+4*i+4])[0]) for i in range(s.ng+1)]
        s.cmap=s._cmap()
    def u16(s,o): return struct.unpack(">H",s.d[o:o+2])[0]
    def i16(s,o): return struct.unpack(">h",s.d[o:o+2])[0]
    def _cmap(s):
        c=s.t["cmap"][0]; n=s.u16(c+2); best=None
        for i in range(n):
            pid,eid,off=struct.unpack(">HHI",s.d[c+4+8*i:c+12+8*i]); fmt=s.u16(c+off)
            if fmt in (4,12) and (best is None or fmt>best[0]): best=(fmt,c+off)
        fmt,o=best; m={}
        if fmt==4:
            seg=s.u16(o+6)//2; e=o+14; st=e+2*seg+2; dl=st+2*seg; ro=dl+2*seg
            for i in range(seg):
                end,start,delta,roff=s.u16(e+2*i),s.u16(st+2*i),s.i16(dl+2*i),s.u16(ro+2*i)
                for ch in range(start,end+1):
                    if ch==0xFFFF: continue
                    if roff==0: g=(ch+delta)&0xFFFF
                    else:
                        g=s.u16(ro+2*i+roff+2*(ch-start)); g=(g+delta)&0xFFFF if g else 0
                    m[ch]=g
        else:
            ng=struct.unpack(">I",s.d[o+12:o+16])[0]
            for i in range(ng):
                a,b,g=struct.unpack(">III",s.d[o+16+12*i:o+28+12*i])
                for ch in range(a,b+1): m[ch]=g+(ch-a)
        return m
    def adv(s,g):
        h=s.t["hmtx"][0]; g=min(g,s.nhm-1); return s.u16(h+4*g)
    def contours(s,g):
        g0=s.t["glyf"][0]; a,b=s.loca[g],s.loca[g+1]
        if a==b: return []
        o=g0+a; nc=s.i16(o)
        if nc<0: return s._composite(o+10)
        ends=[s.u16(o+10+2*i) for i in range(nc)]; ip=o+10+2*nc; il=s.u16(ip); p=ip+2+il
        npts=ends[-1]+1; flags=[]
        while len(flags)<npts:
            f=s.d[p]; p+=1; flags.append(f)
            if f&8:
                r=s.d[p]; p+=1; flags+= [f]*r
        def coords(short,same):
            nonlocal p; v=0; out=[]
            for f in flags:
                if f&short:
                    dv=s.d[p]; p+=1; v+= dv if f&same else -dv
                elif not f&same:
                    v+=s.i16(p); p+=2
                out.append(v)
            return out
        xs=coords(2,16); ys=coords(4,32)
        pts=[(xs[i],ys[i],bool(flags[i]&1)) for i in range(npts)]
        cs=[];st=0
        for e in ends: cs.append(pts[st:e+1]); st=e+1
        return cs
    def _composite(s,o):
        out=[]
        while True:
            fl,gi=s.u16(o),s.u16(o+2); o+=4
            if fl&1: dx,dy=s.i16(o),s.i16(o+2); o+=4
            else: dx,dy=struct.unpack(">bb",s.d[o:o+2]); o+=2
            a=b=c=dd=1.0; b=c=0.0
            if fl&8: a=dd=s.i16(o)/16384; o+=2
            elif fl&0x40: a,dd=s.i16(o)/16384,s.i16(o+2)/16384; o+=4
            elif fl&0x80: a,b,c,dd=[s.i16(o+2*k)/16384 for k in range(4)]; o+=8
            for cn in s.contours(gi): out.append([(a*x+c*y+dx, b*x+dd*y+dy, on) for x,y,on in cn])
            if not fl&0x20: break
        return out
    def kern(s,g1,g2):
        """GPOS lookup type 2 (pair adjustment), XAdvance of first glyph."""
        if "GPOS" not in s.t: return 0
        base=s.t["GPOS"][0]; ll=base+s.u16(base+8); tot=0
        for li in range(s.u16(ll)):
            L=ll+s.u16(ll+2+2*li); lt=s.u16(L)
            for si in range(s.u16(L+4)):
                st=L+s.u16(L+6+2*si); typ=lt
                if lt==9: typ=s.u16(st+2); st=st+struct.unpack(">I",s.d[st+4:st+8])[0]
                if typ!=2: continue
                v=s._pair(st,g1,g2)
                if v is not None: tot+=v; break
        return tot
    def _cov(s,o,g):
        f=s.u16(o)
        if f==1:
            n=s.u16(o+2); arr=[s.u16(o+4+2*i) for i in range(n)]
            return arr.index(g) if g in arr else -1
        n=s.u16(o+2)
        for i in range(n):
            a,b,si=s.u16(o+4+6*i),s.u16(o+6+6*i),s.u16(o+8+6*i)
            if a<=g<=b: return si+g-a
        return -1
    def _cls(s,o,g):
        f=s.u16(o)
        if f==1:
            st,n=s.u16(o+2),s.u16(o+4)
            return s.u16(o+6+2*(g-st)) if st<=g<st+n else 0
        n=s.u16(o+2)
        for i in range(n):
            a,b,c=s.u16(o+4+6*i),s.u16(o+6+6*i),s.u16(o+8+6*i)
            if a<=g<=b: return c
        return 0
    def _vsize(s,vf): return 2*bin(vf).count("1")
    def _xadv(s,o,vf):
        # read the XAdvance field from a ValueRecord at o
        off=0
        for bit in (1,2):
            if vf&bit: off+=2
        return s.i16(o+off) if vf&4 else 0
    def _pair(s,st,g1,g2):
        fmt=s.u16(st); ci=s._cov(st+s.u16(st+2),g1)
        if ci<0: return None
        vf1,vf2=s.u16(st+4),s.u16(st+6); sz1,sz2=s._vsize(vf1),s._vsize(vf2)
        if fmt==1:
            ps=st+s.u16(st+10+2*ci); n=s.u16(ps); rec=2+sz1+sz2
            for i in range(n):
                if s.u16(ps+2+rec*i)==g2: return s._xadv(ps+4+rec*i,vf1)
            return None
        c1=s._cls(st+s.u16(st+8),g1); c2=s._cls(st+s.u16(st+10),g2); n2=s.u16(st+14)
        rec=sz1+sz2; o=st+16+(c1*n2+c2)*rec
        return s._xadv(o,vf1)
def contour_path(cn,X,Y):
    """TrueType quadratic contour -> SVG path (with implied on-curve midpoints)."""
    pts=list(cn); n=len(pts)
    if not any(p[2] for p in pts): pts.insert(0,((pts[0][0]+pts[-1][0])/2,(pts[0][1]+pts[-1][1])/2,True)); n+=1
    k=next(i for i,p in enumerate(pts) if p[2]); pts=pts[k:]+pts[:k]
    f=lambda v: f"{round(v,2):g}"
    out=[f"M{f(X(pts[0][0]))} {f(Y(pts[0][1]))}"]; i=1; pts.append(pts[0])
    while i<len(pts):
        p=pts[i]
        if p[2]: out.append(f"L{f(X(p[0]))} {f(Y(p[1]))}"); i+=1
        else:
            nx=pts[i+1] if i+1<len(pts) else pts[0]
            end=nx if nx[2] else ((p[0]+nx[0])/2,(p[1]+nx[1])/2,True)
            out.append(f"Q{f(X(p[0]))} {f(Y(p[1]))} {f(X(end[0]))} {f(Y(end[1]))}"); i+= 2 if nx[2] else 1
    return "".join(out)+"Z"
def text_path(font,text,size,x0,baseline,tracking_em=0.0):
    sc=size/font.upm; x=0; out=[]; gs=[font.cmap[ord(ch)] for ch in text]
    for i,g in enumerate(gs):
        for cn in font.contours(g):
            out.append(contour_path(cn,lambda v,x=x: x0+(x+v)*sc, lambda v: baseline-v*sc))
        x+=font.adv(g)+(font.kern(g,gs[i+1]) if i+1<len(gs) else 0)+tracking_em*font.upm
    return "".join(out), x*sc - tracking_em*size
