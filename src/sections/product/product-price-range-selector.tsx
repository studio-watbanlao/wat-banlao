import { useState } from 'react';
import { Box, Slider, TextField, InputAdornment, Grid, Stack } from '@mui/material';

const PriceRangeSelector = () => {
  const [priceRange, setPriceRange] = useState<number[]>([1000, 5000]); // Initial min and max values
  const [minInput, setMinInput] = useState(priceRange[0]);
  const [maxInput, setMaxInput] = useState(priceRange[1]);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
    setMinInput((newValue as number[])[0]);
    setMaxInput((newValue as number[])[1]);
  };

  const handleMinInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10) || 0;
    setMinInput(value);
    setPriceRange([value, priceRange[1]]);
  };

  const handleMaxInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10) || 0;
    setMaxInput(value);
    setPriceRange([priceRange[0], value]);
  };

  return (
    <Box mt={1}>
      <Grid container spacing={2}>
        <Grid size={6}>
          <TextField
            value={minInput}
            onChange={handleMinInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">฿</InputAdornment>,
            }}
            type="number"
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid size={6}>
          <TextField
            value={maxInput}
            onChange={handleMaxInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">฿</InputAdornment>,
            }}
            type="number"
            variant="outlined"
            size="small"
          />
        </Grid>
      </Grid>
      <Stack my={2}>
        <Slider
          value={priceRange}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          min={0}
          max={10000}
          step={100}
          sx={{
            color: 'primary.main',
          }}
        />
      </Stack>
    </Box>
  );
};

export default PriceRangeSelector;
