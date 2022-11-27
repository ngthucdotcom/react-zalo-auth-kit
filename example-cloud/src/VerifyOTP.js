import React, {useState} from 'react';
import PropTypes from "prop-types";

const VerifyOTP = (props) => {

    const {phoneNumber, onSubmit, onCancel} = props;

    const [otp, setOtp] = useState('');

    const handleSubmitOtp = (event) => {
        if (otp === "" || (otp.length < 6 || otp.length > 6)) return;
        console.log('verify', {event, otp, phoneNumber});
        onSubmit(otp)
    }

    const handleCancel = () => {
        onCancel(false);
    }

    return (
        <div>
            <div>Verify your phone number</div>
            <div>
                <p className="firebaseui-text">Enter the 6-digit code we sent to
                    <span className="firebaseui-link firebaseui-change-phone-number-link firebaseui-id-change-phone-number-link">
                        {phoneNumber}
                    </span>
                </p>
                <div
                    className="firebaseui-textfield mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-upgraded"
                    data-upgraded=",MaterialTextfield"
                >
                    <input
                        type="number"
                        name="phoneConfirmationCode"
                        id="standard-basic ui-sign-in-phone-confirmation-code-input"
                        className="mdl-textfield__input firebaseui-input firebaseui-id-phone-confirmation-code"
                        onChange={(e) => setOtp(e.target.value)}
                        value={otp}
                    />
                </div>
                <div className="firebaseui-error-wrapper">
                    <p className="firebaseui-error firebaseui-text-input-error firebaseui-hidden firebaseui-id-phone-confirmation-code-error">
                        {otp.length !== 6 ? "Invalid verification code" : ''}
                    </p>
                </div>
            </div>
            <div>
                <div className="firebaseui-form-actions">
                    <button
                        className="firebaseui-id-secondary-link firebaseui-button mdl-button mdl-js-button mdl-button--primary"
                        data-upgraded=",MaterialButton" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button
                        className="firebaseui-id-submit firebaseui-button mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
                        data-upgraded=",MaterialButton" onClick={handleSubmitOtp}>
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

VerifyOTP.propsTypes = {
    phoneNumber: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
}

VerifyOTP.defaultProps = {
    phoneNumber: '',
    onSubmit() {},
    onCancel() {}
}

export default VerifyOTP;
