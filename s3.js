//import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
//import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { apigetAwsProperties } from '../api';

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
//import { ManagedUpload } from '@aws-sdk/s3-request-presigner';

// 上传图片到S3
export function uploadS3(files, callback) {
    return new Promise(async (resolve, reject) => {
        const data = await getS3ConfigurationFun();
        const uploadedFiles = []; // 存储上传成功的文件信息
        const s3 = new S3Client({
            region: "ap-northeast-1",
            credentials: {
                ...data
            }
        });

        // 判断files是数组还是单独的file文件对象
        if (Array.isArray(files)) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                await uploadFile(file, s3, callback, uploadedFiles);
            }
        } else {
            await uploadFile(files, s3, callback, uploadedFiles);
        }

        // resolve(uploadedFiles);
        //兼容原oos 配置
        resolve({ flieUrl: uploadedFiles })
    });
}

async function uploadFile(file, s3, callback, uploadedFiles) {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
    const Newrandom = `${random_number(6)}_${file.name}`;
    const fileName = `${formattedDate}/${Newrandom}`;
    // const Newrandom = `${random_number(6)}_${file.name}`;
    // const fileName = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}/${Newrandom}`;

    const params = {
        Bucket: "ant-community",
        Key: fileName,
        Body: file,
        ACL: "public-read",
        // onUploadProgress: function (progress) {
        //     const percentage = Math.round((progress.loaded / progress.total) * 100);
        //     typeof callback === "function" && callback(percentage);
        // }  上传进度条暂时有问题
    };

    const command = new PutObjectCommand(params);


    try {
        //创造随机上传数
        let number = 0;
        let total = 0;
        let intervalId = setInterval(() => {
            const randomNum = Math.floor(Math.random() * 50); // 生成0到99之间的随机数
            total += randomNum;
            if (total <= 100) {
                number += randomNum;
                typeof callback === "function" && callback(number);
            }
            if (total >= 90 && total <= 100) {
                clearInterval(intervalId);
            }
        }, 500);


        await s3.send(command);
        //实时进度条暂时有问题 ，只能成功时候兼容oos 返回100
        clearInterval(intervalId);
        typeof callback === "function" && callback(100);
        // const fileUrl = `https://ant-community.s3.ap-northeast-1.amazonaws.com/${fileName}`;
        const fileUrl = ` https://ant-community.ant-sea.com/${fileName}`;

        // uploadedFiles.push({ fileName: Newrandom, fileUrl });
        uploadedFiles.push(fileUrl);
    } catch (err) {
        reject(err);
    }
}



//产生随机数
function random_number(len) {
    len = len || 32;
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = chars.length;
    var pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

//获取S3配置
const getS3ConfigurationFun = async () => {
    // let data = {
    //     accessKeyId: 'Your_Access_Key_Id',
    //     secretAccessKey: 'Your_Secret_Access_Key',
    //     sessionToken: 'Your_Session_Token',
    // };
    return await apigetAwsProperties()
}

// //上传图片的回调函数
// async function uploadImage(event) {
//     const file = event.target.files[0];
//     const fileName = file.name;

//     try {
//         await uploadS3(file, (progress) => {
//             console.log(`Upload progress: ${progress}%`);
//         });

//         const directLink = await getSignedURL(fileName);
//         console.log(`Direct link to uploaded file: ${directLink}`);
//     } catch (error) {
//         console.error("Uploading image:", error);
//     }
// }

// //调用上传图片函数
// uploadImage();
