import styles from "./index.module.css";
import ObjectDetector from "./components/objectDetection/index";

const App = () => {
  return (
    <div className={styles.appContainer}>
      <ObjectDetector />
    </div>
  );
};

export default App;
