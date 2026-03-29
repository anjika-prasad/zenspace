import Lottie from "lottie-react";
import animationData from "../assets/lofi.json";

function LofiGirl() {
  return (
    <div className="lofi-container">
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
}

export default LofiGirl;
