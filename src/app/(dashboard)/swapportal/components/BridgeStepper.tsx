import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepConnector from '@mui/material/StepConnector';
import { styled } from '@mui/material/styles';
import { StepIconProps } from '@mui/material/StepIcon';

type Progress =
    | 'idle'
    | 'approving'
    | 'approved'
    | 'quoting'
    | 'sending'
    | 'sent'
    | 'waitingBase'
    | 'done'
    | 'error';

const STEPS = [
    'Approve (if needed)',
    'Quote fee',
    'Send on Polygon',
    'Finalize on Base',
    'Complete',
];

const NEON = '#9FE870';

// Custom Connector styling
const NeonConnector = styled(StepConnector)(() => ({
    [`& .MuiStepConnector-line`]: {
        borderColor: 'rgba(255,255,255,0.22)',
        borderTopWidth: 2,
        borderRadius: 1,
        height: 2,
    },
    [`&.Mui-active .MuiStepConnector-line, 
    &.Mui-completed .MuiStepConnector-line`]: {
        borderColor: NEON,
        boxShadow: `0 0 6px ${NEON}`,
    },
}));

// Custom StepIcon for neon dot
function NeonStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;
    const filled = active || completed;
    return (
        <Box
            className={className}
            sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: filled ? NEON : 'rgba(255,255,255,0.35)',
                boxShadow: filled ? `0 0 6px ${NEON}` : 'none',
            }}
        />
    );
}

// Function to get active step based on progress
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

export function BridgeStepper({
    progress,
}: {
    progress: Progress;
}) {
    const activeStep = getActiveStep(progress);
    // if (activeStep < 0 && !showWhenIdle) return null;

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
