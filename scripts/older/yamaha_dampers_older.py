"""Damper settings from the adjustment procedures of Yamaha 2010-2017 Owner's Service Manuals.

Two layouts, both read column by column (yamaha_dampers.column_lines):
A. 2010-2013 four-strokes and the two-strokes: "ADJUSTING THE FRONT FORK REBOUND DAMPING FORCE" ... "Extent of adjustment:
   Maximum Minimum / Fully turned in position  20 clicks out (from maximum position)" ... "Standard position: [About] 14 clicks out
   / * About 16 clicks out / * Except for USA and CDN".
B. 2014-2017 four-strokes: "ADJUSTING THE FRONT FORK LEGS" / "ADJUSTING THE REAR SHOCK ABSORBER ASSEMBLY", a sub-heading
   ("Rebound damping", "Compression damping", "Fast compression damping", ...), then "... adjusting positions / Maximum / Fully
   turned in / Standard / 11 clicks out* / Minimum / 20 clicks out*" and "* With the adjuster fully turned in".
A market alternative printed with a star is never read; the unstarred value is used only when the star's footnote names the other
markets ("* For EUROPE", "* Except for USA and CDN") and not the USA. "About" is kept in the value.
Rows: (pdf page, None, "<Front|Rear> suspension / <damper> / Adjustment value from the start position (Soft|STD|Hard)", value, unit)."""
import re,sys,os,pdfplumber
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','manual-textlayer'))
import yamaha_dampers
HEAD=re.compile(r'^ADJUSTING THE (FRONT FORK|REAR SHOCK)')
GROUP=[(r'FRONT FORK REBOUND','Front suspension / Rebound damping'),(r'FRONT FORK COMPRESSION','Front suspension / Compression damping'),
       (r'REAR SHOCK ABSORBER REBOUND','Rear suspension / Rebound damping'),(r'REAR SHOCK ABSORBER LOW COMPRESSION','Rear suspension / Slow compression damping'),
       (r'REAR SHOCK ABSORBER HIGH COMPRESSION','Rear suspension / Fast compression damping')]
NUM=r'(?:\d+-\d+/\d+–\d+-\d+/\d+|\d+-\d+/\d+|\d+/\d+|\d+(?:[-–]\d+)?)(?:\s?±\s?\d+/\d+)?'   # incl. a range "1-1/3–1-2/3"
U=r'(clicks?|turns?|click \(s\)|turn \(s\))'      # 2012-2015 WR450F print "18 click (s) out*"
DV=re.compile(r'^((?:About )?'+NUM+r')\s+'+U+r'\s+out\*?$')
SUBB=re.compile(r'^(Rebound damping|Compression damping|Fast compression damping|Slow compression damping|High compression damping|Low compression damping)$')
NAMES={'High compression damping':'Fast compression damping','Low compression damping':'Slow compression damping'}
def unit_of(u): return re.sub(r' \(s\)$|s$','',u)
def foot_ok(lines):
    """The star footnotes near a standard value must name markets other than the USA."""
    f=[l for l in lines if l.startswith('*') and not DV.match(l.lstrip('* '))]
    return all(re.search(r'Except for USA|For (EUROPE|EUR|AUS|NZ|ZA|CDN|CAN)\b',l) and not re.search(r'For USA',l) for l in f)
def style_a(lines):
    out=[];problems=[];i=0;done=set()
    while i<len(lines):
        pg,t=lines[i]
        if not HEAD.match(t): i+=1; continue
        h=t; j=i+1
        while j<len(lines) and not re.match(r'^\d\.',lines[j][1]) and len(h)<120: h+=' '+lines[j][1]; j+=1
        grp=next((g for k,g in GROUP if re.search(k,h)),None)
        if not grp or grp in done: i=j; continue
        block=[]; k=j
        while k<len(lines) and not HEAD.match(lines[k][1]) and not lines[k][1].startswith('CHECKING'): block.append(lines[k]); k+=1
        txt=[b[1] for b in block]
        try: e=txt.index('Maximum Minimum')
        except ValueError: problems.append((grp,'no extent')); i=k; continue
        ext=' '.join(txt[e+1:e+3])
        mx=re.search(r'Fully turned in',ext); mn=re.search(r'(\S+)\s+(clicks?|turns?)\s+out',ext)
        try: s=txt.index('Standard position:')
        except ValueError: problems.append((grp,'no standard')); i=k; continue
        win=txt[s+1:s+5]; std=next((DV.match(l) for l in win if DV.match(l)),None)
        if not (mx and mn and std) or not foot_ok(win+txt[s+5:s+7]): problems.append((grp,'incomplete or market',ext,txt[s:s+6])); i=k; continue
        unit=mn.group(2).rstrip('s')
        if std.group(2).rstrip('s')!=unit: problems.append((grp,'unit mismatch')); i=k; continue
        done.add(grp)
        for lab,val in (('Soft',mn.group(1)),('STD',std.group(1)),('Hard','0')): out.append((block[s][0],None,f'{grp} / Adjustment value from the start position ({lab})',val,unit))
        i=k
    return out,problems
CODE=re.compile(r'^E[A-Z0-9@]*\d[A-Z0-9@]*\s*')
TAGGED=re.compile(r'^((?:About )?'+NUM+r')\s+'+U+r'\s+out\*?((?:\s*\([A-Z]{2,3}\))*)$')
def style_b(lines):
    """2014-2017 four-strokes. Headings carry their EAS code with the first letters set into it ("EAASB111D103 JUSTING THE FRONT
    FORK LEGS"); market-tagged values "8 clicks out* (USA) (CAN)" keep the (USA) line only."""
    out=[];problems=[];section=None;cur=None;state=None;done=set()
    def close():
        if not cur: return
        g=cur['group']
        if g in done: return
        std=[v for v,u,tags in cur['STD'] if not tags or '(USA)' in tags]
        tagged=any(tags for _,_,tags in cur['STD'])
        if tagged: std=[v for v,u,tags in cur['STD'] if '(USA)' in tags]
        units={u for _,u,_ in cur['STD']}|({cur['Soft'][1]} if cur['Soft'] else set())
        if cur['Hard']=='0' and len(std)==1 and cur['Soft'] and len(units)==1 and cur['foot'] and not cur.get('dup'):
            done.add(g); u=units.pop()
            for lab,v in (('Soft',cur['Soft'][0]),('STD',std[0]),('Hard','0')): out.append((cur['page'],None,f'{g} / Adjustment value from the start position ({lab})',v,u))
        elif cur['STD'] or cur['Soft']: problems.append((g,'incomplete',{k:cur[k] for k in ('STD','Soft','Hard','foot')}))
    for pg,t in lines:
        t=t.strip(); h=CODE.sub('',t)
        m=re.match(r'^(?:AD)?JUSTING THE (FRONT FORK|REAR SHOCK ABSORB)',h)
        if m: close(); cur=None; section={'FRONT FORK':'Front suspension','REAR SHOCK ABSORB':'Rear suspension'}[m.group(1)]; continue
        if h!=t and re.match(r'^[A-Z][A-Z ,\-]{8,}$',h) or re.match(r'^(CHECKING|ADJUSTING|BLEEDING|REPLACING|CLEANING)\b',h):
            close(); cur=None; section=None; continue
        if section:
            g=None
            if re.match(r'^Rebound damping$',t): g='Rebound damping'
            elif re.match(r'^Compression damping$',t): g='Compression damping'
            elif re.match(r'^Compression damping \(for fast compres',t): g='Fast compression damping'
            elif re.match(r'^Compression damping \(for slow compres',t): g='Slow compression damping'
            if g:
                g=section+' / '+g
                if not (cur and cur['group']==g): close(); cur={'group':g,'page':pg,'Soft':None,'STD':[],'Hard':None,'foot':False}; state=None
                continue
        if not cur: continue
        if t=='Maximum': state='Hard'; continue
        if t=='Standard': state='STD'; continue
        if t=='Minimum': state='Soft'; continue
        if re.match(r'^\* ?With the adjust(er|ing screw|ing bolt) fully turned',t): cur['foot']=True; state=None; continue
        if state=='Hard' and t.startswith('Fully turned in'): cur['Hard']='0'; state=None; continue
        v=TAGGED.match(t)
        if state=='STD' and v: cur['STD'].append((v.group(1),unit_of(v.group(2)),v.group(3).strip())); continue
        if state=='STD' and re.fullmatch(r'(\([A-Z]{2,3}\)\s*)+',t) and cur['STD']:
            x=cur['STD'][-1]; cur['STD'][-1]=(x[0],x[1],(x[2]+' '+t).strip()); continue       # market tags wrapped to the next line
        if state=='Soft' and v:
            if cur['Soft'] is not None or v.group(3): cur['dup']=True
            cur['Soft']=(v.group(1),unit_of(v.group(2))); state=None; continue
        if state and t: state=None
    close()
    return out,problems
def dampers(path):
    lines=list(yamaha_dampers.column_lines(pdfplumber.open(path)))
    a,pa=style_a(lines); b,pb=style_b(lines)
    if a and b: return [],[('both layouts found',len(a),len(b))]
    return (a,pa) if a else (b,pb)
if __name__=='__main__':
    o,p=dampers(sys.argv[1]); print('PROBLEMS',p)
    for x in o: print(x)
