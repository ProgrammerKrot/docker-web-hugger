import Docker from 'dockerode';
import os from 'os';

const isWindows = os.platform() === 'win32';

const dockerOptions = isWindows
    ? { socketPath: '//./pipe/docker_engine' }
    : { socketPath: '/var/run/docker.sock' };

export const docker = new Docker(dockerOptions);

export default docker;
