import { useState } from 'react';
import 'antd/dist/antd.css';
import './css/App.css';

import SimulatorUI from "./SimulatorUI"
function App() {
	const [page, setPage] = useState(1)
	return (
	<div className="page-layout">
		<div className=' bg-dark2 p-1 pt-3  pl-4 shadow d-flex '>
			<h2 className='center'>Simulation tool</h2>
		</div>
		<main>
			<div className="container">
			<SimulatorUI/>
			</div>
		</main>
	</div>
  );
}

export default App;
