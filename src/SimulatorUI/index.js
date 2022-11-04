import react, { useState, useRef, useEffect } from "react"
import config from "../config"

const SimulatorUI = () => {
    const dragItem = useRef();
    const dragOverItem = useRef();
    const [newTask, setNewTask] = useState("");
    const [storage, setStorage] = useState([{
        name: "new",
        id: "first",
        setBlances: [],
        simulates: []


    }]);
    const [WSstate, setWSstate] = useState(false)
    const [activeIdx, setActiveIdx] = useState(0)
    const [WS, setWS] = useState();
    const op_types = [
        "",
        "quote_approve",
        "approve",
        "addliquidity",
        "limitbuy",
        "fomobuy",
        "sell",
        "blockjump",
        "function_call",
        "custom"

    ];
    const [op_type, setOp_type] = useState("")

    const addTask = () => {
        if (newTask !== "") {
            let _storage = [...storage];
            let date = new Date();
            _storage.push({
                id: date.getTime(),
                start: false,
                name: newTask,
                blockNumber: "",
                tokenAddy: "",
                quoteTokenAddy: "",
                setBlances: [],
                simulates: []

            });
            setStorage(_storage);
        }
    }
    const removeTask = (ind) => {
        let _storage = [...storage];
        if (storage[ind].start == true) {
            alert("Sorry! You can't remove simulating task! Try again after stop this simulation.")
            return;
        }
        if (ind == _storage.length - 1) {
            setActiveIdx(state => (state - 1))
        }
        _storage.splice(ind, 1);

        setStorage(_storage);

    }
    const importExistingTask = (taskInd) => {
        let _storage = localStorage.getItem("simulation");
        _storage = JSON.parse(_storage);
        let currentInd = activeIdx;
        let _task = { ..._storage[taskInd] }
        _task = { ..._task, name: _storage[activeIdx].name };
        _storage[currentInd] = _task
        _storage = JSON.parse(JSON.stringify(_storage))
        setStorage([..._storage]);
    }
    const handleSubmit = () => {
        if (!WSstate) {
            alert("This app is not connected to server! Please check the server!")
            return;
        }
        let _storage = [...storage];
        let _config = {

            ...storage[activeIdx]
        }
        console.log(WS)
        if (WS.readyState != 0) {
            WS.send(JSON.stringify(_config))
        }
        _storage[activeIdx].start = !_storage[activeIdx].start
        setStorage(_storage)
    }
    //setBlockNumber || tokenAddy ||quoteTokenAddy
    const handleChangeProperty = (e) => {
        let _storage = [...storage];
        _storage[activeIdx][e.target.name] = e.target.value;
        setStorage(_storage);
    }
    const deleteBalance = (ind) => {
        let _storage = [...storage];
        _storage[activeIdx].setBlances.splice(ind, 1);
        setStorage(_storage);
    }
    const AddBalance = () => {
        let _storage = [...storage];
        if (!_storage[activeIdx].setBlances)
            _storage[activeIdx].setBlances = [];
        _storage[activeIdx].setBlances.push({ address: "", value: "" })
        setStorage(_storage);
    }
    const setBalance = (ind, e) => {
        let _storage = [...storage];
        _storage[activeIdx].setBlances[ind][e.target.name] = e.target.value;
        setStorage(_storage);
    }
    const AddSimulation = () => {
        if (op_type === "") {
            return;
        }
        let _storage = [...storage];
        if (!_storage[activeIdx].simulates) {
            _storage[activeIdx].simulates = [];
        }
        _storage[activeIdx].simulates.push({
            op_type: op_type
        })
        setStorage(_storage)
    }
    const removeSimulation = (ind) => {
        let _storage = [...storage];
        _storage[activeIdx].simulates.splice(ind, 1)
        setStorage(_storage)
    }
    const changeSimulation = (ind, e) => {
        let _storage = [...storage];
        _storage[activeIdx].simulates[ind][e.target.name] = e.target.value;
        setStorage(_storage);
    }
    const drop = e => {
        const _storage = [...storage];
        const copyListItems = _storage[activeIdx].simulates;
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setStorage(_storage);
    }
    const dragEnter = (e, position) => {
        dragOverItem.current = position;

    }
    const dragStart = (e, position) => {
        dragItem.current = position;

    }
    useEffect(() => {
        let _storage = localStorage.getItem("simulation");
        if (_storage) {
            _storage = JSON.parse(_storage);
            setStorage(_storage);
        }
        let wss = new WebSocket(config.server);
        setWS(wss);
        wss.onmessage = (e) => {
            let data = JSON.parse(e.data);
            if (data.type == "stop") {
                let _storage = JSON.parse(localStorage.getItem("simulation"));
                console.table(_storage)
                let index = _storage.findIndex(item => { return item.id == data.id })
                //console.log(index,id)
                _storage[index].start = false;
                console.log(_storage)
                setStorage(_storage)
            }
        }
        wss.onopen = (e) => {
            setWSstate(true)
        }
        wss.onclose = (e) => {
            setWSstate(false)
        }
    }, [])
    useEffect(() => {
        let _storage = [...storage]
        localStorage.setItem("simulation", JSON.stringify(_storage));
    }, [storage])

    return (
        <div>
            <div className="rounded shadow" >
                <div className="row border-dark p-3 ">
                    <div className="col-md-3 bg-dark2 " style={{ height: "inherit", borderRight: "4px solid dimgrey" }}>
                        <div className=" p-4 rounded" style={{ height: "100%" }}>

                            <button className="btn btn-primary" onClick={e => { addTask(); setNewTask("") }} >
                                New Simulation
                            </button>
                            <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} className="form-control mt-3" />
                            <h5 className="underline pl-2">List of Simulation</h5>
                            <div>
                                <ul className="list-group">
                                    {storage.map((item, index) => (

                                        <li key={index} onClick={e => setActiveIdx(index)} className={activeIdx == index ? "list-group-item d-flex mt-1 justify-content-between align-item center task-item active " : storage[index].start ? "list-group-item d-flex mt-1 justify-content-between align-item center task-item  bg-danger" : "list-group-item d-flex mt-1 justify-content-between align-item center task-item "}>
                                            {item.name}
                                            <span className="close" onClick={e => { removeTask(index) }}>&times;</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>
                    {storage.length > 0 && (


                        <div className="col-md-9 bg-dark2">
                            <div className=" p-5 rounded" style={{ height: "100%" }}>
                                <div className="row">
                                    <div className="col-md-3">
                                        <label>
                                            IMPORT FROM OTHER Simulation
                                        </label>
                                        <select className="form-select" onChange={e => { importExistingTask(e.target.value) }}>
                                            <option> Custom Simulation</option>
                                            {storage.map((item, index) => {
                                                return index != activeIdx && (
                                                    <option key={index} value={index} >{item.name}</option>
                                                )

                                            })}

                                        </select>
                                    </div>
                                    <div className="col-md-9 rtl">
                                        {
                                            storage[activeIdx] &&
                                            (<button className={storage[activeIdx].start ? "btn btn-danger" : "btn btn-primary"} onClick={e => handleSubmit()}>{storage[activeIdx].start ? "stop" : "Simulate"}</button>)

                                        }
                                    </div>

                                </div>
                                <div className="row mt-2">
                                    <div className="col-md-4">
                                        <label >blocknumber:</label>
                                        <input type="text" className="form-control form-control-sm " name="blockNumber" onChange={handleChangeProperty} value={storage[activeIdx].blockNumber} />

                                    </div>
                                    <div className="col-md-4">
                                        <label >Token Address:</label>
                                        <input type="text" name="tokenAddy" className="form-control form-control-sm" onChange={handleChangeProperty} value={storage[activeIdx].tokenAddy} />

                                    </div>
                                    <div className="col-md-4">
                                        <label >Quote Token Address:</label>
                                        <input type="text" name="quoteTokenAddy" className="form-control form-control-sm" onChange={handleChangeProperty} value={storage[activeIdx].quoteTokenAddy} />

                                    </div>
                                </div>
                                <hr />
                                <div>
                                    <h6>Set Balances<span className="btn-sm border ml-3" onClick={e => AddBalance()} >+</span></h6>


                                    {!storage[activeIdx].setBlances && (
                                        <div className="center"> No datas</div>
                                    )}
                                    {storage[activeIdx].setBlances && storage[activeIdx].setBlances.map((item, ind) => {
                                        return (
                                            <div className="row" key={ind}>
                                                <div className="col-md-5">
                                                    <label>Address</label>
                                                    <input type="text" onChange={e => { setBalance(ind, e) }} name="address" value={item.address} className="form-control form-control-sm" />
                                                </div>
                                                <div className="col-md-5">
                                                    <label>value</label>

                                                    <input type="text" onChange={e => { setBalance(ind, e) }} name="value" value={item.value} className="form-control form-control-sm" />
                                                </div>
                                                <div className="col-md-2 pt-4 ">
                                                    <span className="btn btn-sm" onClick={() => { deleteBalance(ind) }}><i className="far fa-trash-alt" ></i></span>
                                                </div>
                                            </div>

                                        )
                                    })}
                                </div>
                                <hr />
                                <div>
                                    <h6>Transactions For Simulation</h6>


                                    {storage[activeIdx].simulates && storage[activeIdx].simulates.map((item, ind) => (
                                        <div key={ind} className="border m-1 p-0 pl-5 pr-5 pt-1 rounded" draggable onDragStart={e => dragStart(e, ind)} onDragEnter={e => dragEnter(e, ind)} onDragEnd={drop}>
                                            {(item.op_type === "limitbuy" || item.op_type === "sell" || item.op_type === "addliquidity" || item.op_type === "fomobuy"||item.op_type == "function_call" ||item.op_type =="custom") && (

                                                <div className="d-flex justify-content-between">
                                                    <h6>{item.op_type.toUpperCase()}</h6>
                                                    <div>
                                                        <button className="btn " onClick={e => { removeSimulation(ind) }}><i className="far fa-trash-alt" ></i></button>
                                                    </div>
                                                </div>
                                            )}
                                            {item.op_type === "blockjump" && (
                                                <div className="row">
                                                    <div className="col-md-2">
                                                    <h6>{item.op_type.toUpperCase()}</h6>
                                                    </div>
                                                    <div className="col-md-2 d-flex justify-content-end">
                                                        blockjump:
                                                    </div>
                                                    <div className="col-md-4">
                                                        <input type="text" className="form-control form-control-sm" value={storage[activeIdx].simulates[ind].blockjump} name="blockjump" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col d-flex justify-content-end">
                                                        <button className="btn " onClick={e => { removeSimulation(ind) }}><i className="far fa-trash-alt" ></i></button>
                                                    </div>
                                                </div>
                                            )}
                                            {item.op_type === "quote_approve" && (
                                                <div className="row">
                                                     <div className="col-md-2">
                                                    <h6>{item.op_type.toUpperCase()}</h6>
                                                    </div>
                                                    <div className="col-md-2 d-flex justify-content-end">
                                                        from:
                                                    </div>
                                                    <div className="col-md-6">
                                                        <input type="text" className="form-control form-control-sm" name="from" value={storage[activeIdx].simulates[ind].from} onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col d-flex justify-content-end">
                                                        <button className="btn " onClick={e => { removeSimulation(ind) }}><i className="far fa-trash-alt" ></i></button>
                                                    </div>
                                                </div>
                                            )}
                                            {item.op_type === "approve" && (
                                                <div className="row">
                                                     <div className="col-md-2">
                                                    <h6>{item.op_type.toUpperCase()}</h6>
                                                    </div>
                                                    <div className="col-md-2 d-flex justify-content-end">
                                                        from:
                                                    </div>
                                                    <div className="col-md-6">
                                                        <input type="text" className="form-control form-control-sm" value={storage[activeIdx].simulates[ind].from} name="from" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col d-flex justify-content-end">
                                                        <button className="btn " onClick={e => { removeSimulation(ind) }}><i className="far fa-trash-alt" ></i></button>
                                                    </div>
                                                </div>
                                            )}

                                            {item.op_type === "addliquidity" && (
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>from1</label>
                                                        <input type="text" className="form-control form-control-sm" name="from" onChange={e => { changeSimulation(ind, e) }} value={storage[activeIdx].simulates[ind].from} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label>token_amount</label>
                                                        <input type="text" className="form-control form-control-sm" placeholder="80%" name="token_amount" value={storage[activeIdx].simulates[ind].token_amount} onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label>eth_amount</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].eth_amount} className="form-control form-control-sm" name="eth_amount" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label>gasLimit</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].gasLimit} className="form-control form-control-sm" name="gasLimit" placeholder="3000000" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col">
                                                    </div>
                                                </div>
                                            )}

                                            {item.op_type === "fomobuy" && (
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>from</label>
                                                        <input type="text" className="form-control form-control-sm" value={storage[activeIdx].simulates[ind].from} name="from" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label>eth_amount</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].eth_amount} className="form-control form-control-sm" name="eth_amount" onChange={e => { changeSimulation(ind, e) }} placeholder="" />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label>gasLimit</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].gasLimit} className="form-control form-control-sm" name="gasLimit" placeholder="900000" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>

                                                    <div className="col">
                                                    </div>
                                                </div>
                                            )}
                                            {item.op_type === "function_call" && (
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        <label>function</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].function} className="form-control form-control-sm" name="function" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label>params</label>
                                                        <input type="text" className="form-control form-control-sm" value={storage[activeIdx].simulates[ind].params} name="params" onChange={e => { changeSimulation(ind, e) }} placeholder='[true, 1000000000, "0x00"]' />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label>gasLimit</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].gasLimit} className="form-control form-control-sm" name="gasLimit" placeholder="500000" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>

                                                    <div className="col">
                                                    </div>
                                                </div>
                                            )}
                                            {item.op_type === "limitbuy" && (
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>from</label>
                                                        <input type="text" className="form-control form-control-sm" value={storage[activeIdx].simulates[ind].from} name="from" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label>token_amount</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].token_amount} className="form-control form-control-sm" placeholder="1%" name="token_amount" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label>eth_amount_max</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].eth_amount} className="form-control form-control-sm" name="eth_amount_max" onChange={e => { changeSimulation(ind, e) }} placeholder="1" />
                                                    </div>

                                                    <div className="col-md-4">
                                                        <label>gasLimit</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].gasLimit} className="form-control form-control-sm" name="gasLimit" placeholder="200000" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col">
                                                    </div>
                                                </div>
                                            )}
                                            {item.op_type === "sell" && (
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>from</label>
                                                        <input type="text" className="form-control form-control-sm" value={storage[activeIdx].simulates[ind].from} name="from" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label>token_amount</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].token_amount} className="form-control form-control-sm" name="token_amount" onChange={e => { changeSimulation(ind, e) }} placeholder='0.5%' />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label>gasLimit</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].gasLimit} className="form-control form-control-sm" name="gasLimit" placeholder="200000" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col">
                                                    </div>
                                                </div>
                                            )}
                                            {item.op_type === "custom" && (
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>from</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].from} className="form-control form-control-sm" name="from" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label>to</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].to} className="form-control form-control-sm" name="to" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label>data</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].data} className="form-control form-control-sm" name="data" onChange={e => { changeSimulation(ind, e) }} placeholder="0x1d97b7cd" />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label>value</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].value} className="form-control form-control-sm" name="value" placeholder="0" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label>gasLimit</label>
                                                        <input type="text" value={storage[activeIdx].simulates[ind].gasLimit} className="form-control form-control-sm" name="gasLimit" placeholder="200000" onChange={e => { changeSimulation(ind, e) }} />
                                                    </div>
                                                    <div className="col">
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    ))}

                                    <div className="m-3 row">
                                        <div className="col-md-4">
                                            <select className="form-control form-select form-control-sm" value={op_type} onChange={e => { setOp_type(e.target.value) }} >
                                                {op_types.map(item => (
                                                    <option key={item} value={item} >{item}</option>
                                                ))}
                                            </select>

                                        </div>
                                        <div className="col">
                                            <button className="btn btn-dark btn-sm" onClick={e => { AddSimulation() }}>ADD</button>
                                        </div>

                                    </div>
                                </div>
                                <div className="text-center">
                                    {
                                        storage[activeIdx] &&
                                        (<button className="btn btn-primary" onClick={e => handleSubmit()}> Simulate</button>)

                                    }
                                </div>








                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default SimulatorUI;
