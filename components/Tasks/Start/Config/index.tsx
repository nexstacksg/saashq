import { zodResolver } from '@hookform/resolvers/zod';
import type { TransitionProps } from 'notistack';
import { useSnackbar } from 'notistack';
import type { FC, ReactElement, Ref } from 'react';
import { forwardRef, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Stack,
  TextField,
  Slide,
  Badge,
} from '@mui/material';
import { useReactFlow } from 'reactflow';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const startConfigSchema = z.object({
  label: z
    .string({
      required_error: 'Label is required',
    })
    .min(1, 'Label is required'),
});

export type StartConfigSchema = z.infer<typeof startConfigSchema>;

interface Props {
  onSubmit: (value: StartConfigSchema) => void;
  initialValue: StartConfigSchema;
  deleteNode: Function;
  id: string;
}

const StartConfigPanel: FC<Props> = ({ onSubmit, initialValue, deleteNode, id }) => {
  const { getNodes } = useReactFlow();
  const [openConfigPanel, setOpenConfigPanel] = useState<boolean>(false);
  const [labelUniqueError, setLabelUniqueError] = useState<string | null>(null);

  const { control, handleSubmit, formState, watch } = useForm<StartConfigSchema>({
    resolver: zodResolver(startConfigSchema),
    values: {
      label: initialValue?.label ?? '',
    },
  });

  const labelValue = watch('label');

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const nodes = getNodes();

      if (
        nodes
          .filter((node) => node.id !== id)
          .map((node) => node?.data?.label)
          .includes(labelValue)
      ) {
        setLabelUniqueError(() => 'Task name already exists');
      } else {
        setLabelUniqueError(() => null);
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [getNodes, id, labelValue]);

  const submitHandler = handleSubmit(async (value) => {
    onSubmit(value);
    enqueueSnackbar('Config changed successfully', {
      variant: 'success',
      autoHideDuration: 2 * 1000,
    });
    handleConfigPanelClose();
  });

  const handleConfigPanelOpen = () => {
    setOpenConfigPanel(() => true);
  };

  const handleConfigPanelClose = () => {
    setOpenConfigPanel(() => false);
  };

  return (
    <>
      <Badge color="error" badgeContent={Object.keys(formState.errors).length + (labelUniqueError ? 1 : 0)}>
        <Button variant="outlined" onClick={handleConfigPanelOpen}>
          Configure
        </Button>
      </Badge>
      <Dialog fullScreen open={openConfigPanel} onClose={handleConfigPanelClose} TransitionComponent={Transition}>
        <AppBar position="sticky">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleConfigPanelClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {[initialValue?.label, 'Configuration'].join(' ')}
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg">
          <Stack
            sx={{
              paddingY: 2,
              paddingX: 2,
            }}
            justifyContent={'flex-start'}
            alignItems={'flex-start'}
            rowGap={2}
          >
            <form
              style={{
                width: '100%',
              }}
              onSubmit={submitHandler}
            >
              <Stack rowGap={4}>
                <Controller
                  control={control}
                  name="label"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Label"
                      placeholder="Name of the Task"
                      error={!!fieldState?.error?.message || !!labelUniqueError}
                      helperText={labelUniqueError ?? fieldState?.error?.message}
                      fullWidth
                    />
                  )}
                />

                <Button variant="contained" type="submit">
                  Submit
                </Button>
              </Stack>
            </form>
            <Button
              variant="contained"
              color="error"
              type="button"
              onClick={() => {
                deleteNode();
              }}
            >
              Delete Task
            </Button>
          </Stack>
        </Container>
      </Dialog>
    </>
  );
};

export default StartConfigPanel;
