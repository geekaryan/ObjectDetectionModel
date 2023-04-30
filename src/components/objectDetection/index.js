import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { useRef, useState } from "react";

import styles from "./index.module.css";

const ObjectDetector = (props) => {
  const fileInputRef = useRef();
  const [imgData, setImgData] = useState(null);

  const openFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  //tensorflow part

  const readImage = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = () => reject(fileReader.error);
      fileReader.readAsDataURL(file);
    });
  };

  const onSelectImage = async (e) => {
    const file = e.target.files[0];
    const imgData = await readImage(file);

    setImgData(imgData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.detector}>
        {imgData && (
          <img src={imgData} className={styles.target} alt="imgData" />
        )}
        <input
          className={styles.hidden}
          onChange={onSelectImage}
          type="file"
          ref={fileInputRef}
        />
      </div>
      <div>
        <button className={styles.selectbutton} onClick={openFilePicker}>
          Select Image
        </button>
      </div>
    </div>
  );
};

export default ObjectDetector;
