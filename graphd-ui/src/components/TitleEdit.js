import * as React from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Edit } from '@material-ui/icons';

import { SelectedChartContext } from '../contexts/SelectedChartContext.js';

function TitleEdit(props) {

    const [titleDirty, setTitleDirty] = React.useState(false);

    const { selectedChart, updateTitle } = React.useContext(SelectedChartContext);

    const titleRef = React.useRef(null);

    const titleKeyDown = (e) => {
        if (e.key === 'Enter') {
            titleRef.current.blur()
        }
    }

    return (
        <TextField
            variant='standard'
            value={selectedChart?.metadata?.title || ''}
            inputRef={titleRef}
            onChange={(e) => { setTitleDirty(true); updateTitle(e.target.value); }}
            onBlur={() => { titleDirty && props.onSave() }}
            onKeyDown={(e) => titleKeyDown(e)}
            fullWidth
            disableGutters
            InputProps={{
                style: { fontSize: '1.25rem' },
                disableUnderline: true,
                endAdornment: (
                    <InputAdornment position='end'>
                        <IconButton onClick={() => titleRef.current && titleRef.current.focus()}>
                            <Edit />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    )
}

export { TitleEdit };