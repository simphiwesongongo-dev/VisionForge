'use client';

import { useMemo, useState } from 'react';
import {
  Sparkles, Film, Clapperboard, WandSparkles, Mic2, Captions,
  Music2, Download, Plus, Play, ChevronDown, Image as ImageIcon,
  Settings2, Layers3, Clock3, Check, Zap, LayoutTemplate, CircleHelp
} from 'lucide-react';

type Scene = { id: number; title: string; visual: string; narration: string; seconds: number; mood: string };
const styles = [
  { name: 'Cinematic', detail: 'Realistic, dramatic footage', icon: Film },
  { name: '3D Animation', detail: 'Stylised worlds & characters', icon: Sparkles },
  { name: 'Advertisement', detail: 'Premium product storytelling', icon: Clapperboard },
  { name: 'Social Video', detail: 'Fast, engaging short-form', icon: Zap },
  { name: 'Education', detail: 'Clear visual explainers', icon: Layers3 },
  { name: 'Music Video', detail: 'Rhythm-led visual sequences', icon: Music2 },
];

function makeStoryboard(prompt: string, style: string, duration: number): Scene[] {
  const clean = prompt.trim() || 'A tiny dinosaur discovers a magical forest';
  const count = Math.max(3, Math.min(8, Math.round(duration / 8)));
  const beats = [
    ['The Hook', 'Open on an intriguing wide shot that immediately establishes the world and mood.'],
    ['Meet the World', 'Introduce the main subject with a smooth camera move and clear visual detail.'],
    ['A New Discovery', 'Reveal a surprising detail; build curiosity with a closer shot.'],
    ['The Challenge', 'Add movement and a small obstacle that creates momentum.'],
    ['The Turning Point', 'Shift the lighting and framing as the story changes direction.'],
    ['The Payoff', 'Deliver the most memorable visual moment with confident composition.'],
    ['The Big Finish', 'End on a strong hero shot with a satisfying sense of resolution.'],
    ['Final Frame', 'Hold a clean final image suitable for a title, logo, or call to action.'],
  ];
  return Array.from({ length: count }, (_, i) => {
    const beat = beats[i] || beats[beats.length - 1];
    return {
      id: i + 1,
      title: beat[0],
      visual: `${clean}. ${beat[1]} Style: ${style.toLowerCase()}, coherent visual continuity, intentional camera movement, polished lighting, no accidental text or logos.`,
      narration: i === 0 ? `Every great story begins with a moment. ${clean}.` :
        i === count - 1 ? 'And that is where the next chapter begins.' : `${beat[0]}. The story continues to unfold.`,
      seconds: Math.floor(duration / count) + (i < duration % count ? 1 : 0),
      mood: ['Curious', 'Wonder', 'Anticipation', 'Energy', 'Emotion', 'Impact', 'Warm', 'Clear'][i] || 'Cinematic'
    };
  });
}

export default function Home() {
  const [prompt, setPrompt] = useState('Create a cinematic 60-second advert for an electric performance car driving through dramatic mountain roads at sunrise. Premium lighting, precise details, powerful but elegant mood.');
  const [style, setStyle] = useState('Cinematic');
  const [duration, setDuration] = useState(60);
  const [ratio, setRatio] = useState('16:9');
  const [voice, setVoice] = useState('Warm, confident');
  const [subtitles, setSubtitles] = useState(true);
  const [music, setMusic] = useState(true);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeScene, setActiveScene] = useState(1);
  const [notice, setNotice] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [generationMode, setGenerationMode] = useState<'automatic' | 'professional'>('automatic');
  const [provider, setProvider] = useState<'higgsfield' | 'runway'>('higgsfield');
  const [model, setModel] = useState('kling-turbo');
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [freeRendering, setFreeRendering] = useState(false);
  const [freeVideoUrl, setFreeVideoUrl] = useState('');

  const totalSeconds = useMemo(() => scenes.reduce((sum, scene) => sum + scene.seconds, 0), [scenes]);
  const active = scenes.find(s => s.id === activeScene);

  async function createFreeMotionVideo() {
    if (typeof window === 'undefined') return;
    const videoScenes = scenes.length ? scenes : makeStoryboard(prompt, style, duration);
    if (!scenes.length) { setScenes(videoScenes); setActiveScene(1); }
    if (!prompt.trim()) { setNotice('Add a prompt before creating your free video.'); return; }
    const canvas = document.createElement('canvas');
    const vertical = ratio === '9:16';
    const square = ratio === '1:1';
    canvas.width = vertical ? 720 : square ? 720 : 1280;
    canvas.height = vertical ? 1280 : 720;
    const ctx = canvas.getContext('2d');
    if (!ctx || !('captureStream' in canvas) || typeof MediaRecorder === 'undefined') {
      setNotice('Free video export needs a modern browser with canvas recording support. Try Chrome, Edge, or desktop Safari.');
      return;
    }
    setFreeRendering(true); setFreeVideoUrl(''); setNotice('Rendering your free motion-graphics video in this browser… Keep this tab open until it finishes.');
    let stream: MediaStream | undefined;
    try {
      stream = canvas.captureStream(30);
      const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type)) || '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      const completed = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }));
        recorder.onerror = () => reject(new Error('The browser could not record this video.'));
      });
      recorder.start(250);
      const totalMs = videoScenes.reduce((sum, scene) => sum + Math.max(2, Math.min(20, scene.seconds)) * 1000, 0);
      let elapsedBefore = 0;
      for (let i = 0; i < videoScenes.length; i++) {
        const scene = videoScenes[i];
        const sceneMs = Math.max(2, Math.min(20, scene.seconds)) * 1000;
        const started = performance.now();
        await new Promise<void>(resolve => {
          const draw = (now: number) => {
            const local = Math.min(1, (now - started) / sceneMs);
            const w = canvas.width, h = canvas.height;
            const gradient = ctx.createLinearGradient(w * (0.15 + local * 0.35), 0, w, h);
            gradient.addColorStop(0, ['#111827','#172554','#312e81','#172033'][i % 4]);
            gradient.addColorStop(1, ['#3b82f6','#0f766e','#7c3aed','#0f172a'][i % 4]);
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
            ctx.globalAlpha = 0.17;
            for (let j = 0; j < 8; j++) {
              ctx.beginPath();
              const radius = Math.min(w,h) * (0.08 + j * 0.025);
              ctx.arc(w * (0.72 + Math.sin(now / 1800 + j) * 0.08), h * (0.27 + Math.cos(now / 2100 + j) * 0.08), radius, 0, Math.PI * 2);
              ctx.fillStyle = j % 2 ? '#c4b5fd' : '#93c5fd'; ctx.fill();
            }
            ctx.globalAlpha = 1;
            const pad = w * 0.075;
            ctx.fillStyle = '#a5b4fc'; ctx.font = `800 ${Math.round(w * 0.018)}px Arial`;
            ctx.fillText(`VISIONFORGE  /  SCENE ${String(i + 1).padStart(2,'0')}`, pad, h * 0.19);
            ctx.fillStyle = '#ffffff'; ctx.font = `700 ${Math.round(w * (vertical ? 0.065 : 0.052))}px Arial`;
            const titleWords = (scene.title || 'Your story').split(/\s+/); let lines: string[] = []; let line = '';
            for (const word of titleWords) { const test = line ? `${line} ${word}` : word; if (ctx.measureText(test).width > w - pad * 2 && line) { lines.push(line); line = word; } else line = test; }
            if (line) lines.push(line);
            lines.slice(0,3).forEach((txt, n) => ctx.fillText(txt, pad, h * 0.39 + n * w * 0.075));
            ctx.fillStyle = '#e2e8f0'; ctx.font = `400 ${Math.round(w * 0.021)}px Arial`;
            const description = scene.visual.replace(/\s+/g,' ').slice(0, 145);
            const words = description.split(' '); let descLines: string[] = []; let descLine = '';
            for (const word of words) { const test = descLine ? `${descLine} ${word}` : word; if (ctx.measureText(test).width > w - pad * 2 && descLine) { descLines.push(descLine); descLine = word; } else descLine = test; }
            if (descLine) descLines.push(descLine);
            descLines.slice(0,3).forEach((txt,n) => ctx.fillText(txt, pad, h * 0.63 + n * w * 0.03));
            if (subtitles && scene.narration) { ctx.fillStyle = '#00000099'; ctx.fillRect(pad * 0.6, h * 0.84, w - pad * 1.2, h * 0.075); ctx.fillStyle = '#fff'; ctx.font = `500 ${Math.round(w * 0.022)}px Arial`; ctx.textAlign = 'center'; ctx.fillText(scene.narration.slice(0,110), w / 2, h * 0.885, w - pad * 2); ctx.textAlign = 'left'; }
            ctx.fillStyle = '#ffffffbb'; ctx.font = `600 ${Math.round(w * 0.014)}px Arial`; ctx.fillText(`${style.toUpperCase()}  ·  ${ratio}`, pad, h * 0.95);
            ctx.fillStyle = '#ffffff55'; ctx.fillRect(pad, h * 0.975, w - pad * 2, Math.max(3,h*0.004)); ctx.fillStyle = '#ffffff'; ctx.fillRect(pad, h * 0.975, (w - pad * 2) * ((elapsedBefore + now - started) / totalMs), Math.max(3,h*0.004));
            if (now - started < sceneMs) requestAnimationFrame(draw); else resolve();
          };
          requestAnimationFrame(draw);
        });
        elapsedBefore += sceneMs;
      }
      recorder.stop();
      const blob = await completed;
      const url = URL.createObjectURL(blob);
      setFreeVideoUrl(url);
      setNotice('Your free motion-graphics video is ready. Download it below. This is a text-and-graphics video, not AI-generated live-action footage.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Free video export failed.');
    } finally {
      stream?.getTracks().forEach(track => track.stop());
      setFreeRendering(false);
    }
  }

  async function generateVideo() {
    if (!prompt.trim()) { setNotice('Add a prompt before generating a video.'); return; }
    setGenerating(true); setVideoUrl(''); setGenerationStatus('Submitting your request…');
    try {
      const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, style, duration, aspectRatio: ratio, mode: generationMode, provider, model, generateAudio: music }) });
      const job = await response.json();
      if (!response.ok) throw new Error(job.error || 'Could not start video generation.');
      setGenerationStatus(`Request accepted by ${job.provider}${job.model ? ` · ${job.model}` : ''}. Waiting for the video…`);
      if (job.note) setNotice(job.note);
      const started = Date.now();
      let receivedVideo = false;
      while (Date.now() - started < 240000) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const statusResponse = await fetch(`/api/status?provider=${encodeURIComponent(job.provider)}&taskId=${encodeURIComponent(job.taskId)}`, { cache: 'no-store' });
        const result = await statusResponse.json();
        if (!statusResponse.ok) throw new Error(result.error || 'Unable to check generation status.');
        const state = String(result.status || 'PENDING').toUpperCase();
        setGenerationStatus(`Video status: ${state.toLowerCase().replaceAll('_', ' ')}…`);
        if (['SUCCEEDED', 'COMPLETED', 'COMPLETE', 'SUCCESS'].includes(state)) {
          if (!result.videoUrl) { setGenerationStatus('Generation completed, but the provider did not return a video URL. Check provider dashboard for the result.'); break; }
          setVideoUrl(result.videoUrl); receivedVideo = true; setGenerationStatus('Your video is ready. Provider links can expire, so save your result.'); break;
        }
        if (['FAILED', 'ERROR', 'CANCELED', 'CANCELLED'].includes(state)) throw new Error(result.error || `Generation ${state.toLowerCase()}.`);
      }
      if (!receivedVideo && Date.now() - started >= 240000) setGenerationStatus('Still processing. Your provider may take longer; check its dashboard or retry status later.');
    } catch (err) { setGenerationStatus(''); setNotice(err instanceof Error ? err.message : 'Video generation failed.'); }
    finally { setGenerating(false); }
  }

  function createStoryboard() {
    if (!prompt.trim()) { setNotice('Add a prompt first, then create your storyboard.'); return; }
    const next = makeStoryboard(prompt, style, duration);
    setScenes(next);
    setActiveScene(1);
    setNotice('Storyboard created for free. Edit your scenes, then export a motion-graphics video without an API key.');
  }

  function updateScene(id: number, key: keyof Scene, value: string | number) {
    setScenes(old => old.map(s => s.id === id ? { ...s, [key]: value } : s));
  }

  function exportStoryboard() {
    const payload = { project: 'Untitled project', prompt, style, duration: totalSeconds || duration, aspectRatio: ratio, voice, subtitles, music, scenes };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'visionforge-storyboard.json'; a.click();
    URL.revokeObjectURL(url);
    setNotice('Storyboard JSON exported.');
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Sparkles size={21}/></div><div><strong>visionforge</strong><span>AI VIDEO STUDIO</span></div></div>
        <button className="new-project" onClick={() => {setScenes([]); setNotice('New project ready.');}}><Plus size={17}/> New project</button>
        <div className="side-label">WORKSPACE</div>
        <button className="nav-item active"><WandSparkles size={17}/> Create video <span className="nav-dot"/></button>
        <button className="nav-item" onClick={() => setNotice('Your saved projects will appear here once project storage is connected.')}><Layers3 size={17}/> My projects</button>
        <button className="nav-item" onClick={() => setNotice('Templates are on the roadmap for the next iteration.')}><LayoutTemplate size={17}/> Templates</button>
        <div className="side-label second">TOOLS</div>
        <button className="nav-item" onClick={() => setNotice('Brand kits will let you save logos, colours and fonts.')}><ImageIcon size={17}/> Brand kit</button>
        <button className="nav-item" onClick={() => setShowSettings(!showSettings)}><Settings2 size={17}/> Integrations</button>
        <div className="sidebar-bottom"><div className="plan-card"><div className="plan-icon"><Zap size={16}/></div><strong>Free studio</strong><p>Free storyboards and motion-graphics video exports. No subscription required.</p><span className="plan-tag">FREE FOREVER TOOLS</span></div><button className="nav-item help" onClick={() => setNotice('Help: write a specific prompt, create a storyboard, edit scenes, then export JSON. AI media generation needs provider API integration.')}><CircleHelp size={17}/> Help centre</button><div className="user-row"><div className="avatar">VF</div><div><strong>Creator</strong><span>Personal workspace</span></div><ChevronDown size={15}/></div></div>
      </aside>

      <section className="main-panel">
        <header className="topbar"><div className="crumb">Workspace <span>/</span> <b>Create video</b></div><div className="top-actions"><span className="secure"><span/> Private workspace</span><button className="icon-btn" onClick={() => setShowSettings(!showSettings)} aria-label="Settings"><Settings2 size={18}/></button><button className="avatar small">VF</button></div></header>
        <div className="page-content">
          <div className="heading-row"><div><div className="eyebrow"><Sparkles size={14}/> YOUR CREATIVE STUDIO</div><h1>Turn your ideas into <em>video.</em></h1><p className="subheading">From a single prompt to a story worth watching.</p></div><div className="beta-pill"><span/> STUDIO PREVIEW</div></div>
          {showSettings && <div className="integration-banner"><div><strong>Free studio + optional AI providers</strong><p>Storyboard creation, editing, JSON export and motion-graphics video export are free and need no API key. Photorealistic AI footage through external providers is optional and may cost money. Keys are kept on the server.</p></div><button className="text-button" onClick={() => setShowSettings(false)}>Close</button></div>}
          <div className="workspace-grid">
            <section className="builder-column">
              <div className="section-card prompt-card">
                <div className="card-heading"><div className="step-number">01</div><div><h2>Describe your video</h2><p>Tell us what you want your audience to see.</p></div><span className="ai-chip"><Sparkles size={13}/> AI assisted</span></div>
                <label className="field-label" htmlFor="prompt">YOUR IDEA</label>
                <textarea id="prompt" className="prompt-input" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the story, subject, atmosphere, and visual style..."/>
                <div className="prompt-footer"><span>{prompt.length} characters</span><button className="enhance-button" onClick={() => setPrompt(p => p.trim() ? `${p.trim()} Consistent visual continuity, intentional camera movement, expressive composition, high production value, clean transitions, strong opening and memorable ending.` : p)}><WandSparkles size={14}/> Enhance prompt</button></div>
              </div>

              <div className="section-card style-card">
                <div className="card-heading compact"><div className="step-number">02</div><div><h2>Choose a visual direction</h2><p>Pick the look that fits your story.</p></div></div>
                <div className="style-grid">{styles.map(({name, detail, icon: Icon}) => <button key={name} className={`style-option ${style === name ? 'selected' : ''}`} onClick={() => setStyle(name)}><div className="style-icon"><Icon size={19}/></div><div className="style-copy"><strong>{name}</strong><span>{detail}</span></div>{style === name && <Check className="selected-check" size={16}/>}</button>)}</div>
              </div>

              <div className="section-card engine-card">
                <div className="card-heading compact"><div className="step-number">AI</div><div><h2>Generation engine</h2><p>Automatic for ease, Professional for more control.</p></div></div>
                <div className="mode-switch"><button className={generationMode === 'automatic' ? 'mode-active' : ''} onClick={() => setGenerationMode('automatic')}><Sparkles size={14}/> Automatic</button><button className={generationMode === 'professional' ? 'mode-active' : ''} onClick={() => setGenerationMode('professional')}><Settings2 size={14}/> Professional</button></div>
                {generationMode === 'automatic' ? <p className="engine-note">VisionForge selects a model based on your visual style and clip length. You can still choose a provider below.</p> : <div className="professional-fields"><div><label className="field-label">VIDEO PROVIDER</label><select value={provider} onChange={e => setProvider(e.target.value as 'higgsfield' | 'runway')}><option value="higgsfield">Higgsfield API</option><option value="runway">Runway API</option></select></div>{provider === 'higgsfield' && <div><label className="field-label">MODEL</label><select value={model} onChange={e => setModel(e.target.value)}><option value="kling-turbo">Kling 3.0 Turbo · balanced</option><option value="wan-prime">Wan 3.0 Prime · longer clips</option></select></div>}<p className="engine-note">Professional mode exposes model/provider choices. Provider limits and billing apply.</p></div>}
                {generationMode === 'automatic' && <div className="professional-fields"><div><label className="field-label">PREFERRED PROVIDER</label><select value={provider} onChange={e => setProvider(e.target.value as 'higgsfield' | 'runway')}><option value="higgsfield">Higgsfield API</option><option value="runway">Runway API</option></select></div></div>}
              </div>
              <div className="section-card settings-card">
                <div className="card-heading compact"><div className="step-number">03</div><div><h2>Fine-tune your video</h2><p>Set the format, pacing, and audio.</p></div></div>
                <div className="settings-grid">
                  <div className="setting"><label className="field-label">DURATION</label><div className="select-wrap"><Clock3 size={16}/><select value={duration} onChange={e => setDuration(Number(e.target.value))}><option value={15}>15 seconds</option><option value={30}>30 seconds</option><option value={60}>60 seconds</option><option value={90}>90 seconds</option><option value={180}>3 minutes</option></select><ChevronDown size={14}/></div></div>
                  <div className="setting"><label className="field-label">ASPECT RATIO</label><div className="ratio-options">{['16:9','9:16','1:1'].map(r => <button key={r} className={ratio === r ? 'ratio active-ratio' : 'ratio'} onClick={() => setRatio(r)}>{r}</button>)}</div></div>
                  <div className="setting"><label className="field-label">VOICEOVER STYLE</label><div className="select-wrap"><Mic2 size={16}/><select value={voice} onChange={e => setVoice(e.target.value)}><option>Warm, confident</option><option>Energetic storyteller</option><option>Calm documentary</option><option>Playful character</option><option>No voiceover</option></select><ChevronDown size={14}/></div></div>
                  <div className="setting toggle-setting"><div><label className="field-label">SUBTITLES</label><span>Captions on video</span></div><button aria-label="Toggle subtitles" className={`toggle ${subtitles ? 'on' : ''}`} onClick={() => setSubtitles(!subtitles)}><span/></button></div>
                  <div className="setting toggle-setting"><div><label className="field-label">BACKGROUND MUSIC</label><span>Set the emotional tone</span></div><button aria-label="Toggle music" className={`toggle ${music ? 'on' : ''}`} onClick={() => setMusic(!music)}><span/></button></div>
                </div>
              </div>
              <button className="generate-button" onClick={createStoryboard}><Sparkles size={18}/> Create storyboard <span>→</span></button>
              <p className="fine-print">Free: storyboard, scene editing, JSON export and motion-graphics video. No account or API key required.</p>
              <button className="generate-button free-video-button" onClick={createFreeMotionVideo} disabled={freeRendering}><Film size={18}/> {freeRendering ? 'Rendering free video…' : 'Create free motion video'} <span>{freeRendering ? '…' : '↓'}</span></button>
              {freeVideoUrl && <div className="generation-result"><video controls playsInline src={freeVideoUrl}/><a href={freeVideoUrl} download="visionforge-free-video.webm">Download free video (WebM) ↗</a></div>}
              <p className="fine-print">Optional photorealistic AI footage uses external providers and may incur charges.</p>
              <button className="generate-button video-generate" onClick={generateVideo} disabled={generating}><Film size={18}/> {generating ? 'Generating video…' : 'Generate AI video'} <span>{generating ? '…' : '→'}</span></button>
              {generationStatus && <div className="generation-result" role="status"><div className="generation-status"><span className={generating ? 'status-pulse' : ''}/>{generationStatus}</div>{videoUrl && <><video controls playsInline src={videoUrl}/><a href={videoUrl} target="_blank" rel="noreferrer">Open / save generated video ↗</a></>}</div>}
            </section>

            <section className="preview-column">
              <div className="preview-head"><div><h2>Storyboard preview</h2><p>Your scenes, shaped into a story.</p></div><button className="export-button" onClick={exportStoryboard} disabled={!scenes.length}><Download size={15}/> Export</button></div>
              <div className={`preview-stage ratio-${ratio.replace(':','-')}`}>
                <div className="stage-grain"/><div className="stage-orb orb-one"/><div className="stage-orb orb-two"/>
                <div className="stage-content">{scenes.length ? <><span className="stage-kicker">SCENE {String(activeScene).padStart(2,'0')} / {String(scenes.length).padStart(2,'0')}</span><h3>{active?.title || 'Your story starts here.'}</h3><p>{active?.visual || 'Your visual direction will appear here.'}</p><div className="stage-duration"><Clock3 size={13}/> {active?.seconds || 0}s scene</div></> : <><div className="preview-logo"><Sparkles size={28}/></div><span className="stage-kicker">YOUR NEXT CREATION</span><h3>Make something<br/><em>unforgettable.</em></h3><p>Your storyboard will appear here once you create it.</p></>} </div>
                <div className="stage-bottom"><span><span className="live-dot"/> PREVIEW CANVAS</span><span>{ratio} · {duration}s target</span></div>
              </div>
              <div className="timeline-heading"><div><h3>Scene timeline</h3><span>{scenes.length ? `${scenes.length} scenes · ${totalSeconds}s total` : 'Your scenes will appear here'}</span></div><button className="small-add" onClick={() => {if (scenes.length) {const id = scenes.length + 1; setScenes([...scenes, {id, title:'New scene', visual:'Describe what happens in this scene.', narration:'', seconds:5, mood:'Custom'}]); setActiveScene(id);} else setNotice('Create a storyboard first, then add scenes.')}}><Plus size={15}/></button></div>
              {scenes.length ? <div className="scene-list">{scenes.map((scene, i) => <button key={scene.id} onClick={() => setActiveScene(scene.id)} className={`scene-row ${activeScene === scene.id ? 'active-scene' : ''}`}><div className={`scene-thumb thumb-${i % 5}`}><span>{String(scene.id).padStart(2,'0')}</span><Play size={13}/></div><div className="scene-info"><strong>{scene.title}</strong><span>{scene.mood} · {scene.seconds}s</span></div><span className="scene-status">{activeScene === scene.id ? 'Selected' : 'Draft'}</span></button>)}</div> : <div className="empty-timeline"><div className="empty-icon"><Film size={19}/></div><strong>No scenes yet</strong><span>Create a storyboard to map out your video.</span></div>}
              {active && <div className="scene-editor"><div className="editor-title"><strong>Edit scene {active.id}</strong><span>Changes apply to your storyboard</span></div><label className="field-label">SCENE TITLE</label><input value={active.title} onChange={e => updateScene(active.id,'title',e.target.value)}/><label className="field-label">VISUAL DESCRIPTION</label><textarea value={active.visual} onChange={e => updateScene(active.id,'visual',e.target.value)}/><label className="field-label">NARRATION</label><textarea value={active.narration} onChange={e => updateScene(active.id,'narration',e.target.value)}/><div className="duration-edit"><label className="field-label">LENGTH (SECONDS)</label><input type="number" min="1" max="60" value={active.seconds} onChange={e => updateScene(active.id,'seconds',Math.max(1,Math.min(60,Number(e.target.value))))}/></div></div>}
              <div className="next-step"><div className="next-icon"><Mic2 size={17}/></div><div><strong>Next up: bring it to life</strong><p>Connect video, voice and music providers to generate your finished MP4.</p></div><ChevronDown size={16}/></div>
            </section>
          </div>
          {notice && <div className="toast" role="status"><Check size={16}/><span>{notice}</span><button onClick={() => setNotice('')}>×</button></div>}
          <footer className="footer"><span>VISIONFORGE STUDIO <b>·</b> CREATIVE TOOLS FOR BIG IDEAS</span><span>Free Studio <b>·</b> v0.3</span></footer>
        </div>
      </section>
    </main>
  );
}
