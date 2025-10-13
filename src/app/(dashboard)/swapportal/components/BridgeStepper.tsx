import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { styled } from '@mui/material/styles';
import { StepIconProps } from '@mui/material/StepIcon';

type Progress =
    | 'idle' | 'approving' | 'approved' | 'quoting' | 'sending' | 'sent' | 'waitingBase' | 'done' | 'error';

const STEPS = [
    'Approve (if needed)',
    'Quote fee',
    'Send on Polygon',
    'Finalize on BASE',
    'Complete',
];

const NEON = '#9FE870';
const ICON_BOX = 24;   // StepIcon container (matches MUI expectation)
const DOT = 12;        // actual glowing dot

const NeonConnector = styled(StepConnector)(() => ({
    // ensure the connector is vertically centered against a 24px icon box
    [`&.${stepConnectorClasses.alternativeLabel}`]: { top: ICON_BOX / 2 }, // 12
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: 'rgba(255,255,255,0.22)',
        borderTopWidth: 2,
        borderRadius: 1,
        height: 2,
    },
    [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}, 
    &.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
        borderColor: NEON,
        boxShadow: `0 0 6px ${NEON}`,
    },
}));

function NeonStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;
    const filled = active || completed;

    return (
        <Box
            className={className}
            sx={{
                // 24x24 container so the connector centers at top: 12px
                width: ICON_BOX,
                height: ICON_BOX,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    width: DOT,
                    height: DOT,
                    borderRadius: '50%',
                    background: filled ? NEON : 'rgba(255,255,255,0.35)',
                    boxShadow: filled ? `0 0 6px ${NEON}` : 'none',
                }}
            />
        </Box>
    );
}

function getActiveStep(p: Progress) {
    switch (p) {
        case 'approving': return 0;
        case 'approved':
        case 'quoting': return 1;
        case 'sending':
        case 'sent': return 2;
        case 'waitingBase': return 3;
        case 'done': return 4;
        default: return -1;
    }
}

export function BridgeStepper({ progress }: { progress: Progress }) {
    const activeStep = getActiveStep(progress);

    return (
        <Box sx={{ width: '100%' }}>
            <Stepper
                alternativeLabel
                activeStep={Math.max(activeStep, 0)}
                connector={<NeonConnector />}
                sx={{
                    '& .MuiStep-root': { flex: 1, p: 0 },
                    '& .MuiStepLabel-root': { textAlign: 'center', typography: 'caption' },
                }}
            >
                {STEPS.map((label) => (
                    <Step key={label}>
                        <StepLabel StepIconComponent={NeonStepIcon}>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
}
