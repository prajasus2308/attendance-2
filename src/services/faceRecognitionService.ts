import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';

let model: blazeface.BlazeFaceModel | null = null;

export const loadModels = async () => {
    try {
        await tf.ready();
        model = await blazeface.load();
        console.log('Blazeface model loaded successfully');
    } catch (error) {
        console.warn('Failed to load Blazeface model.', error);
    }
};

export const detectFace = async (videoElement: HTMLVideoElement): Promise<boolean> => {
    if (!model) {
        console.warn('Model not loaded yet.');
        return false;
    }
    try {
        const predictions = await model.estimateFaces(videoElement, false);
        return predictions.length > 0;
    } catch (error) {
        console.error('Face detection error:', error);
        return false;
    }
};
