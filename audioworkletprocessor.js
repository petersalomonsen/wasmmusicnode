const SAMPLE_FRAMES = 128;

class AssemblyScriptMidiSynthAudioWorkletProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.processorActive = true;
        this.playSong = true;

        this.port.onmessage = async (msg) => {
            if (msg.data.wasm) {
                this.wasmInstancePromise = WebAssembly.instantiate(msg.data.wasm, {
                    environment: {
                        SAMPLERATE: sampleRate || AudioWorkletGlobalScope.sampleRate
                    }
                });
                this.wasmInstance = (await this.wasmInstancePromise).instance.exports;

                this.port.postMessage({ wasmloaded: true });
            }
        };
        this.port.start();
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];

        if (this.wasmInstance) {
            this.wasmInstance.playEventsAndFillSampleBuffer();

            output[0].set(new Float32Array(this.wasmInstance.memory.buffer,
                this.wasmInstance.samplebuffer,
                SAMPLE_FRAMES));
            output[1].set(new Float32Array(this.wasmInstance.memory.buffer,
                this.wasmInstance.samplebuffer + (SAMPLE_FRAMES * 4),
                SAMPLE_FRAMES));
        }

        return this.processorActive;
    }
}

registerProcessor('asc-midisynth-audio-worklet-processor', AssemblyScriptMidiSynthAudioWorkletProcessor);