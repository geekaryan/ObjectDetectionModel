import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
// import "@tensorflow/tfjs-core";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { useRef, useState } from "react";

import styles from "./index.module.css";
import styled from "styled-components";

//--->Styled css<-----
const TargetBox = styled.div`
  position: absolute;
  left: ${({ x }) => x + "px"};
  top: ${({ y }) => y + "px"};
  width: ${({ width }) => width + "px"};
  height: ${({ height }) => height + "px"};

  border: 4px solid #lac71a;
  background-color: transparent;
  z-index: 20;

  &::before {
    content: "${({ classType, score }) => `${classType} ${score.toFixed(2)}`}";
    color: #lac71a;
    font-weight: 500;
    font-size: 17px;
    position: absolute;
    top: -1.5rem;
    left: -5px;
  }
`;

const ObjectDetector = (props) => {
  const fileInputRef = useRef();
  const [imgData, setImgData] = useState(null);
  const [prediction, setPrediction] = useState([]);

  const isEmptyPredications = !prediction || prediction.length === 0;

  const openFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // -------------->> Tensorflow part <----------------------

  const detectObjectOnImage = async (imageElement) => {
    console.log("modellling is running in the back");
    //loading coco model..
    const model = await cocoSsd.load({});

    //this predication is like array with bounding box
    //we detect model having the image..

    const predictions = await model.detect(imageElement, 6);
    setPrediction(predictions);
    console.log("predictions", predictions);
  };

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

    const imageElement = document.createElement("img");
    imageElement.src = imgData;

    imageElement.onload = async () => {
      await detectObjectOnImage(imageElement);
    };
  };

  return (
    <div className={styles.container}>
      <div className={styles.detector}>
        {imgData && (
          <img src={imgData} className={styles.target} alt="imgData" />
        )}
        {!isEmptyPredications &&
          prediction.map((predication, indx) => (
            <TargetBox
              key={indx}
              x={predication.bbox[0]}
              y={predication.bbox[1]}
              width={predication.bbox[2]}
              height={predication.bbox[3]}
              classType={predication.class}
              score={predication.score}
            />
          ))}
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
