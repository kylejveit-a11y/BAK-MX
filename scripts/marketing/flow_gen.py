import sys,json
H="appId: com.bakmx.app\n---\n"
class F:
    def __init__(s,name):s.n=name;s.t=H;s.i=0
    def shot(s,label):s.i+=1;s.t+=f"- takeScreenshot: {s.i:02d}-{label}\n";return s
    def tap(s,text,shot=None,idx=None,exact=False):
        pat=text if exact else f".*{text}.*"
        s.t+=f'- tapOn:\n    text: "{pat}"\n    optional: true\n'+(f'    index: {idx}\n' if idx is not None else '')+"- waitForAnimationToEnd:\n    timeout: 2500\n"
        if shot:s.shot(shot)
        return s
    def scroll(s,shot=None):
        s.t+="- scroll\n"
        if shot:s.shot(shot)
        return s
    def top(s):s.t+="- swipe:\n    direction: DOWN\n    duration: 200\n- swipe:\n    direction: DOWN\n    duration: 200\n- swipe:\n    direction: DOWN\n    duration: 200\n";return s
    def back(s):s.tap("Close|Done|Cancel|Back|Not now").t+="";return s
    def type(s,txt):s.t+=f'- inputText: "{txt}"\n';return s
    def raw(s,y):s.t+=y;return s
    def save(s):open(f'flows/{s.n}.yaml','w').write(s.t)
