import WebTorrent from 'webtorrent';
// @ts-ignore
import MemoryChunkStore from 'memory-chunk-store'
interface MetaDatum {
    name: string,
    size: number,
}
export class MagnetDao {
    /** @throws IOExceptions */
    public async getMetaData(url: string): Promise<MetaDatum[]> {
        const client = new WebTorrent({ dht: true, tracker: true })
        return new Promise<MetaDatum[]>((resolve, reject) => {
            client.add(url, { store: MemoryChunkStore }, (torrent) => {
                const metaData = torrent.files.map(v => ({ name: v.name, size: v.length }));

                client.destroy(() => { resolve(metaData) });
            })
            client.on('error', (err) => { reject(err) })
        })
    }
}
