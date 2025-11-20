import { AudioContext,AudioWorkletNode } from 'node-web-audio-api';
import { readFile} from 'fs/promises';

const wasm_synth_bytes = await readFile(process.argv[process.argv.length-1]);

const context = new AudioContext({ sampleRate: 44100 });
await context.audioWorklet.addModule('./audioworkletprocessor.js');

const audioWorkletNode = new AudioWorkletNode(context, 'asc-midisynth-audio-worklet-processor', {
    outputChannelCount: [2]
});

audioWorkletNode.port.start();
audioWorkletNode.port.postMessage({ wasm: wasm_synth_bytes });
audioWorkletNode.connect(context.destination);
