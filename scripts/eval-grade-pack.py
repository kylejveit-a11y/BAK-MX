"""Grading pack for an eval run: exactly what Ask BAK was given (message, bike, saved weight), its reply, and the published
facts it cited, so graders check numbers against the source. usage: eval-grade-pack.py <answers.json> <out.json>"""
import json,sys
r=json.load(open(sys.argv[1]))
pack=[]
for x in sorted((a for a in r if a.get('ok')),key=lambda a:a['id']):
    resp=x['response']
    pack.append({'id':x['id'],'message_sent':x.get('message_sent') or x['question'],'bike':x['bike'] and {k:x['bike'][k] for k in ('manufacturer','model','model_year')},
        'saved_weight_lb':(x['bike'] or {}).get('configuration',{}).get('geared_weight_lb'),
        'reply':{'summary':resp.get('summary'),'answer':resp.get('answer'),'next_step':resp.get('next_step'),'setup_changes':resp.get('setup_changes')},
        'cited_facts':[s.get('value') for s in resp.get('specifications') or []],
        'claims':[f"{c.get('tier')}: {c.get('claim')}" for c in resp.get('claims') or []]})
json.dump(pack,open(sys.argv[2],'w'),indent=1,ensure_ascii=False);print(len(pack),'answers packed')
