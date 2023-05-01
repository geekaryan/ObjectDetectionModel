import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
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
  background-color: transparent;
  border: 4px solid brown;
  z-index: 20;

  &::before {
    content: "${({ classType, score }) => `${classType} ${score.toFixed(1)}%`}";
    color: brown;
    font-weight: 500;
    font-size: 17px;
    position: absolute;
    top: -1.5rem;
    left: -5px;
  }
`;

const ObjectDetector = (props) => {
  const fileInputRef = useRef();
  const imageRef = useRef();
  const [imgData, setImgData] = useState(null);
  const [prediction, setPrediction] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const isEmptyPredications = !prediction || prediction.length === 0;

  const openFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  //Normalisaton

  const normalizePrediction = (prediction, imgSize) => {
    if (!prediction || !imgSize || !imageRef) return prediction || [];
    return prediction.map((prediction) => {
      const { bbox } = prediction;

      const oldX = bbox[0];
      const oldY = bbox[1];
      const oldWidth = bbox[2];
      const oldHeight = bbox[3];

      const imgWidth = imageRef.current.width;
      const imgHeight = imageRef.current.height;

      const x = (oldX * imgWidth) / imgSize.width;
      const y = (oldY * imgHeight) / imgSize.height;
      const width = (oldWidth * imgWidth) / imgSize.width;
      const height = (oldHeight * imgHeight) / imgSize.height;

      return { ...prediction, bbox: [x, y, width, height] };
    });
  };

  // -------------->> Tensorflow part <----------------------

  const detectObjectOnImage = async (imageElement, imgSize) => {
    console.log("modellling is running in the back");
    //loading coco model..
    const model = await cocoSsd.load({});

    //this predication is like array with bounding box
    //we detect model having the image..

    const predictions = await model.detect(imageElement, 6);
    const normalizePredictions = normalizePrediction(predictions, imgSize);
    setPrediction(normalizePredictions);
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
    setPrediction([]);
    setIsLoading(true);
    const file = e.target.files[0];
    const imgData = await readImage(file);
    setImgData(imgData);

    const imageElement = document.createElement("img");
    imageElement.src = imgData;

    imageElement.onload = async () => {
      const imgSize = {
        width: imageElement.width,
        height: imageElement.height,
      };
      await detectObjectOnImage(imageElement, imgSize);
      setIsLoading(false);
    };
  };

  return (
    <div>
      <div className={styles.heading}>
        <span>Image Recognizing AI </span>
      </div>

      <div className={styles.container}>
        <div className={styles.detector}>
          {imgData && (
            <img
              src={imgData}
              className={styles.target}
              alt="imgData"
              ref={imageRef}
            />
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
                score={predication.score * 100}
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
            {isLoading ? "Recognizing...." : "Select Image"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObjectDetector;
