import * as React from 'react';

import { AppBar, Button, MobileStepper } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { useAnnotationContext } from '../../contexts/AnnotationContext';
import { SelectedChartContext } from '../../contexts/SelectedChartContext';

function AnnotationStepper({ steps, onNext, onPrev }) {
    const { saveMethod, setAnnotation } = useAnnotationContext()
    const [width, setWidth] = React.useState();

    const {
        activeStep,
        setActiveStep
    } = React.useContext(SelectedChartContext);

    const appBarRef = React.useRef(null);

    React.useEffect(() => {
        setWidth(appBarRef.current.parentNode.clientWidth);
    });

    React.useEffect(() => {
        saveMethod.current = steps[activeStep].onBeforeMove
    }, [activeStep, steps])

    const handleNext = async () => {
        onNext();
    };

    const handleBack = async () => {
        onPrev();
    };

    return (
        <>
            <div style={{ padding: '0px 20px 40px 20px' }}>
                {React.Children.map(steps.map(s => s.component), (component, i) => activeStep === i && component)}
            </div>

            <AppBar ref={appBarRef} position="fixed" sx={{
                top: 'auto',
                bottom: 0,
                right: 0,
                width: width - 1,
                boxShadow: 'none',
            }}>
                <MobileStepper
                    variant="text"
                    steps={steps.length}
                    position="static"
                    activeStep={activeStep}
                    style={{ backgroundColor: "#f7f7f7" }}
                    nextButton={
                        <Button
                            size="small"
                            onClick={handleNext}
                            disabled={activeStep === steps.length - 1}
                        >
                            Next
                            <KeyboardArrowRight />
                        </Button>
                    }
                    backButton={
                        <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                            <KeyboardArrowLeft />
                            Back
                        </Button>
                    }
                />
            </AppBar>
        </>
    )
}

export { AnnotationStepper };
