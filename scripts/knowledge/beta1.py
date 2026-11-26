"""Beta RX 300 and RX 450, 2025: Beta USA's published KYB fork and shock settings list (four profiles) with the fork
oil volume and sag ranges, as recorded in the suspension workbook the owner supplied 2026-11-26. Not re-read from the
sheet here, so medium confidence. usage: python3 scripts/knowledge/beta1.py"""
import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'pre2020'))
from _lib import File
F=File('beta1_rx_2025','b-r1','Beta RX 300 and RX 450 2025 KYB settings (2026-11)','Beta',['RX 300','RX 450'],[2025])
s=F.src('manufacturer','Beta USA 2025 KYB fork and shock suspension settings list','https://betausa.com/content/2025%20KYB%20Fork%20%26%20Shock%20suspension%20settings%20list.pdf','2025')
N="Recorded from Beta USA's settings list in a workbook the owner supplied; confirm against the sheet before relying on a click count."
D={'RX 300':dict(fc=(12,10,14,16),fr=(11,12,14,16),ls=(14,8,12,16),hs=(1.5,1.25,1.5,1.75),sr=(14,12,14,16),oil=300),
   'RX 450':dict(fc=(10,7,14,16),fr=(14,12,14,16),ls=(12,7,12,15),hs=(1.5,1.25,1.5,1.75),sr=(12,7,9,12),oil=350)}
def four(v,u): return f"{v[0]} {u} factory, {v[1]} racing, {v[2]} comfort, {v[3]} soft"
for m,d in D.items():
    F.R('suspension','KYB fork and shock settings: factory, racing, comfort and soft',[m],[2025],
      f"Beta's published KYB settings for the 2025 {m}, all counted out from fully in. Fork compression: {four(d['fc'],'clicks')}. Fork rebound: {four(d['fr'],'clicks')}. Shock low-speed compression: {four(d['ls'],'clicks')}. Shock high-speed compression: {four(d['hs'],'turns')}. Shock rebound: {four(d['sr'],'clicks')}. Fork oil volume on the chart is {d['oil']} cc. Sag ranges: 95 to 110 mm rider sag and 25 to 45 mm static sag.",
      {'fork_comp':d['fc'],'fork_reb':d['fr'],'shock_lsc':d['ls'],'shock_hsc':d['hs'],'shock_reb':d['sr'],'fork_oil_cc':d['oil'],'rider_sag_mm':'95-110','static_sag_mm':'25-45'},'OEM',s,'medium',N)
F.write()
