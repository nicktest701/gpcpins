
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import moment from "moment";



function CustomStepper({ logs }) {
  return (
    <div>
  
      <Stepper orientation="vertical">
        {logs?.map((log) => (
          <Step key={log?.title}>
            <StepLabel>
              <Typography variant="body2">{log?.title}</Typography>
              <small style={{ color: "var(--secondary)" }}>
            
                {moment(log?.createdAt).fromNow()}
              </small>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
}

export default CustomStepper;
