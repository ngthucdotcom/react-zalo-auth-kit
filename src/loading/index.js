import React, {useEffect} from 'react'
import { createRoot } from 'react-dom/client';
import './loading-style.css';

// ReactDOM.render is no longer supported in React 18. Use createRoot instead. Learn more: https://reactjs.org/link/switch-to-createroot
// https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis
const Loading = () => {

    useEffect(() => {
		window.onpopstate = function (event) {
			close()
		};
		return () => window.onpopstate = null;
	}, [])

	const close = () => {
		removeElementReconfirm()
	};

	return (
		<div className='react-confirm-alert-overlay'>
			<div className='loading-contain'>
				<div className="box-loading">
					{/*<div className="loading-logo"></div>*/}
					<div className="loading-dot">
						<div className="lds-ellipsis">
							<div/>
							<div/>
							<div/>
							<div/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

function createElementReconfirm(properties) {
    // ReactDOM.render is no longer supported in React 18. Use createRoot instead. Learn more: https://reactjs.org/link/switch-to-createroot
    let divTarget = document.getElementById('react-confirm-alert');
    if (divTarget) {
		// Rerender - the mounted ReactConfirmAlert
		// render(<Loading {...properties} />, divTarget)
        const root = createRoot(divTarget, "react-confirm-alert"); // createRoot(container!) if you use TypeScript
        root.render(<Loading {...properties} />);
	} else {
		// Mount the ReactConfirmAlert component
		document.body.children[0].classList.add('react-confirm-alert-blur')
		divTarget = document.createElement('div')
		divTarget.id = 'react-confirm-alert'
		document.body.appendChild(divTarget)
		// render(<Loading {...properties} />, divTarget)
        const root = createRoot(divTarget, "react-confirm-alert"); // createRoot(container!) if you use TypeScript
        root.render(<Loading {...properties} />);
	}
}

function removeElementReconfirm() {
    let divTarget = document.getElementById('react-confirm-alert');
	if (divTarget) {
		// unmountComponentAtNode(target)
        divTarget.parentNode.removeChild(divTarget)
    }
}

export function ShowLoading() {
	createElementReconfirm()
}

export function HideLoading() {
	removeElementReconfirm()
}