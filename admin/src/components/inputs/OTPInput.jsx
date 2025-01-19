import React from 'react';

function OTPInput() {
  return (
    <div className='otp-input-container'>
      <input
        className='otp-input'
        maxLength={1}
        // max={1}
        minLength={1}
        // min={1}
        // onInputCapture={() => console.log(2)}
        // type='number'
        // type='number'
        inputMode='numeric'
      />
      <input className='otp-input' maxLength={1} />
      <input className='otp-input' maxLength={1} />
      <input className='otp-input' maxLength={1} />
      <input className='otp-input' maxLength={1} />
      <input className='otp-input' maxLength={1} />
    </div>
  );
}

export default OTPInput;
