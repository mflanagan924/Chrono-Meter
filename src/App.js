import React, { useRef, useState } from "react";
import { saveAs } from "file-saver";

function App() {
  const [number, setNumber] = React.useState(0);
  const [timerRunning, setTimerRunning] = React.useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showSaveButton, setShowSaveButton] = React.useState(false);
  const inputRefs = useRef([]);

  function start() {
    setTimerRunning(true);
  }

  React.useEffect(() => {
    let interval;
    if (timerRunning === true) {
      interval = setInterval(() => {
        setNumber((prev) => (prev >= 0 ? prev + 1 : prev));
      }, 10);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (time) => {
    let minutes = Math.floor(time / 6000);
    let seconds = Math.floor((time % 6000) / 100);
    let hundredths = time % 100;
    return (
      (minutes < 10 ? "0" + minutes : minutes) +
      ":" +
      (seconds < 10 ? "0" + seconds : seconds) +
      "." +
      (hundredths < 10 ? "0" + hundredths : hundredths)
    );
  };

  function stop() {
    console.log(number);
    setNumber(0);
    setTimerRunning(false);
  }

  const Table = ({ data }) => {
    const [inputValues, setInputValues] = React.useState(
      Object.fromEntries(data.map((item) => [item.id, item.note]))
    );

    function handleNoteChange(e, id) {
      const { value } = e.target;
      setInputValues((prevValues) => ({
        ...prevValues,
        [id]: value,
      }));
    }

    return (
      <>
        {data.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Number</th>
                <th>Time</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.num}</td>
                  <td>{item.time}</td>
                  <td>
                    <input
                      type="text"
                      value={inputValues[item.id]}
                      onChange={(e) => handleNoteChange(e, item.id)}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setFocusedInput(item.id)}
                      ref={(ref) => (inputRefs.current[item.id] = ref)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </>
    );
  };

  const handleClick = (id) => {
    setFocusedInput(id);
  };

  const [data, setData] = React.useState([]);

  const saveNote = (id, value) => {
    const updatedData = data.map((item) =>
      item.id === id ? { ...item, note: value } : item
    );
    setData(updatedData);
  };

  function saveNotes() {
    inputRefs.current.forEach((ref, id) => {
      const noteValue = ref.value;
      saveNote(id, noteValue);
    });
  }

  function setInputFocus(id) {
    if (inputRefs.current[id]) {
      inputRefs.current[id].focus();
      setFocusedInput(id);
    }
  }

  React.useEffect(() => {
    if (focusedInput !== null && inputRefs.current[focusedInput]) {
      inputRefs.current[focusedInput].focus();
    }
  }, [focusedInput]);

  function pause() {
    setTimerRunning(false);
    const newData = [...data];
    newData.push({
      num: newData.length + 1,
      time: formatTime(number),
      note: "",
      id: newData.length + 1,
    });
    setData(newData);
    setInputFocus(newData.length);

    if (newData.length === 1) {
      setShowSaveButton(true);
    }
  }

  function resetTable() {
    setData([]);
    setInputFocus(0);
    setShowSaveButton(false);
  }

  function exportTableToCSV(filename) {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
    saveAs(blob, filename);
  }

  const convertToCSV = (data) => {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));

    for (const row of data) {
      const values = headers.map((header) => {
        if (header === "time") {
          return `"${row[header]}"`; // Preserve time format without rounding
        }
        return row[header];
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  };
  
  return (
    <div id="timer-container">
      <h1 id="title">Chrono &nbsp;&nbsp;&nbsp; Master</h1>
      <h1 id="timer">{formatTime(number)}</h1>
      <div id="buttons">
      <button id="buttonOne" onClick={start}>Start</button>
      <button id="buttonTwo" onClick={pause}>Pause</button>
      <button id="buttonThree" onClick={stop}>Reset Clock</button>
      <button id="buttonFour" onClick={resetTable}>Reset Table</button>
      </div>
      
      
      <div>
        <div id="table">
        <Table data={data} />

        {showSaveButton && (
          <button id="save-notes" onClick={saveNotes}>
            Save Notes
          </button>
        )}
        </div>
        </div>
        <div>
          {showSaveButton && (
                    <button id="download-table" onClick={() => exportTableToCSV("table.csv")}>Download Table</button>
            )}
        </div>
          
      

    </div>
  );
}

export default App;
