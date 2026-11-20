"""Maakt per scène een mp3 + woordtijden met Edge TTS.  Gebruik: python scripts/tts.py oymyakon"""
import asyncio, json, subprocess, sys, pathlib
import edge_tts

slug = sys.argv[1]
cfg = json.load(open(f'videos/{slug}.json'))
out = pathlib.Path(f'public/audio/{slug}'); out.mkdir(parents=True, exist_ok=True)

async def one(i, text):
    f = out / f'{i:02d}.mp3'
    words = []
    com = edge_tts.Communicate(text, cfg['voice'], rate=cfg.get('rate', '+0%'))
    with open(f, 'wb') as fh:
        async for ch in com.stream():
            if ch['type'] == 'audio': fh.write(ch['data'])
            elif ch['type'] in ('WordBoundary', 'SentenceBoundary'):
                words.append([ch['text'], ch['offset'] / 1e7, (ch['offset'] + ch['duration']) / 1e7])
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)]))
    return {'dur': d, 'words': words}

async def main():
    res = []
    for i, s in enumerate(cfg['scenes']):
        res.append(await one(i, s['text']))
        print(i, round(res[-1]['dur'], 1), 'sec')
    json.dump({'scenes': res}, open(out / 'timings.json', 'w'))
    print('totaal', round(sum(r['dur'] for r in res), 1), 'sec')
asyncio.run(main())
