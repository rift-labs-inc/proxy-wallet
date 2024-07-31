import { useState } from "react"
import riftImage from "data-base64:~assets/rift.svg";
import "./popup.css";

function IndexPopup() {
  const [data, setData] = useState("")
  return (
    <div
      style={{
        backgroundColor: "black",
        width: "300px",  // Set your desired width
        height: "400px", // Set your desired height
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}>
      <img src={riftImage} alt="Rift" width={'84px'} height={'20px'}/>
    </div>
  )
}

export default IndexPopup;
