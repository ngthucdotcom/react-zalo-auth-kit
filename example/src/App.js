import React, {useEffect} from 'react';
import BasicAuth from "./BasicAuth";
import StyledButton from "./StyledButton";
import LoginButton from "./LoginButton";
import {injectDebugger} from "./debugger";
import BasicAuthWithStyledButton from "./BasicAuthWithStyledButton";

function App() {

	useEffect(() => {
		const initial = async () => {
			await injectDebugger();
		}
		initial();
	}, []);

	return (
		<div>
			<div key="styled-button" style={{margin: 20}}>
				<StyledButton/>
				<hr/>
			</div>
			<div key="basic-auth" style={{margin: 20}}>
				<BasicAuth/>
				<hr/>
			</div>
			<div key="styled-auth" style={{margin: 20}}>
				<BasicAuthWithStyledButton/>
				<hr/>
			</div>
			<div key="login-combo" style={{margin: 20}}>
				<LoginButton/>
				<hr/>
			</div>
		</div>
	);
}

export default App;
