const dotenv = require("dotenv");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegStatic);

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const hlsFolder = "hls";

const s3ToS3 = async ({ file, title, author, description}) => {
    console.log(file);
    const { filename } = file;
    const mp4FileName = filename;
    const videotitle = title;
    const videoauthor = author;
    const videodescription = description;
    console.log(videotitle + videoauthor + videodescription);
    const bucketName = process.env.AWS_BUCKET;

    console.log('Starting script');
    console.time('req_time');

    try {
        const mp4FilePath = path.join("uploads", mp4FileName);
        const hlsOutputPath = path.join("hls", mp4FileName);

        const resolutions = [
            {
                resolution: '320x180',
                videoBitrate: '500k',
                audioBitrate: '64k'
            },
            {
                resolution: '854x480',
                videoBitrate: '1000k',
                audioBitrate: '128k'
            },
            {
                resolution: '1280x720',
                videoBitrate: '2500k',
                audioBitrate: '192k'
            }
        ];

        const variantPlaylists = [];
        for (const { resolution, videoBitrate, audioBitrate } of resolutions) {
            console.log(`HLS conversion starting for ${resolution}`);
            const outputFileName = `${mp4FileName.replace(
                '.',
                '_'
            )}_${resolution}.m3u8`;
            const segmentFileName = `${mp4FileName.replace(
                '.',
                '_'
            )}_${resolution}_%03d.ts`;
            await new Promise((resolve, reject) => {
                ffmpeg(mp4FilePath)
                    .outputOptions([
                        `-c:v h264`,
                        `-b:v ${videoBitrate}`,
                        `-c:a aac`,
                        `-b:a ${audioBitrate}`,
                        `-vf scale=${resolution}`,
                        `-f hls`,
                        `-hls_time 10`,
                        `-hls_list_size 0`,
                        `-hls_segment_filename ${hlsFolder}/${segmentFileName}`
                    ])
                    .output(path.join(hlsFolder, outputFileName))
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });
            const variantPlaylist = {
                resolution,
                outputFileName
            };
            variantPlaylists.push(variantPlaylist);
            console.log(`HLS conversion done for ${resolution}`);
        }

        let masterPlaylist = variantPlaylists
            .map((variantPlaylist) => {
                const { resolution, outputFileName } = variantPlaylist;
                const bandwidth =
                    resolution === '320x180'
                        ? 676800
                        : resolution === '854x480'
                            ? 1353600
                            : 3230400;
                return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFileName}`;
            })
            .join('\n');
        masterPlaylist = `#EXTM3U\n` + masterPlaylist;

        const masterPlaylistFileName = `${mp4FileName.replace(
            '.',
            '_'
        )}_master.m3u8`;
        const masterPlaylistPath = path.join(hlsFolder, masterPlaylistFileName);
        fs.writeFileSync(masterPlaylistPath, masterPlaylist);
        console.log(`HLS master m3u8 playlist generated`);

        console.log(`Deleting locally downloaded s3 mp4 file`);
        fs.unlinkSync(mp4FilePath);
        console.log(`Deleted locally downloaded s3 mp4 file`);

        console.log(`Uploading media m3u8 playlists and ts segments to s3`);
        const files = fs.readdirSync(hlsFolder);
        for (const file of files) {
            if (!file.startsWith(mp4FileName.replace('.', '_'))) {
                continue;
            }
            const filePath = path.join(hlsFolder, file);
            const fileStream = fs.createReadStream(filePath);
            const uploadParams = {
                Bucket: bucketName,
                Key: `${hlsFolder}/${file}`,
                Body: fileStream,
                ContentType: file.endsWith('.ts')
                    ? 'video/mp2t'
                    : file.endsWith('.m3u8')
                        ? 'application/x-mpegURL'
                        : null
            };
            await s3.upload(uploadParams).promise();
            fs.unlinkSync(filePath);
        }
        const masterPlaylistUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${hlsFolder}/${masterPlaylistFileName}`;
        console.log(masterPlaylistUrl);
        console.log(`Uploaded media m3u8 playlists and ts segments to s3. Also deleted locally`);
        console.log('Success. Time taken: ');
        console.timeEnd('req_time');


        return { status: 200, message: "Success", "masterUrl": masterPlaylistUrl };
        
    } catch (error) {
        console.error('Error:', error);
    }
};

module.exports = { s3ToS3 };