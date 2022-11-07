import React from 'react';
import ZaloStyledButton from "react-zalo-auth-kit/ZaloStyledButton";

function StyledButton() {
	const [isClicked, setIsClicked] = React.useState(false);

	React.useEffect(() => {
		const toggle = setTimeout(() => {
			setIsClicked(false);
		}, 3000);
		return () => clearTimeout(toggle);
	}, [isClicked]);

	return (
		<div>
			<h1>Styled Button</h1>
			<p>Action: {isClicked ? "Button pressed" : "Button unpressed"}</p>
			<ZaloStyledButton callback={() => setIsClicked(true)}/>
		</div>
	);
}

export default StyledButton;