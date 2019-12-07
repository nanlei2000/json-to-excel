import WebTorrent from 'webtorrent';
interface MetaDatum {
    name: string,
    size: number,
}
export class MagnetDao {
    /** @throws IOExceptions */
    public async getMetaData(url: string): Promise<MetaDatum[]> {
        const client = new WebTorrent({ dht: false, tracker: false })
        return new Promise<MetaDatum[]>((resolve, reject) => {
            client.add(url, (torrent) => {
                resolve(torrent.files.map(v => (
                    { name: v.name, size: v.length })
                ))
            })
            client.on('error', (err) => { reject(err) })
        })
    }
}
