import { forwardRef } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';

import { ImageProps } from './types';
import { getRatio } from './utils';

import {
  applyDefaultContentImage,
  DEFAULT_CONTENT_IMAGE,
  resolveContentImage,
} from 'src/constants/images';

// ----------------------------------------------------------------------

const Image = forwardRef<HTMLSpanElement, ImageProps>(
  (
    {
      ratio,
      overlay,
      disabledEffect = false,
      //
      alt,
      src,
      afterLoad,
      delayTime,
      threshold,
      beforeLoad,
      delayMethod,
      onError,
      placeholder,
      placeholderSrc = DEFAULT_CONTENT_IMAGE,
      wrapperProps,
      scrollPosition,
      effect = 'blur',
      visibleByDefault,
      wrapperClassName,
      useIntersectionObserver,
      sx,
      ...other
    },
    ref
  ) => {
    const theme = useTheme();

    const handleError: NonNullable<ImageProps['onError']> = (event) => {
      applyDefaultContentImage(event);
      onError?.(event);
    };

    const overlayStyles = !!overlay && {
      '&:before': {
        content: "''",
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        zIndex: 1,
        position: 'absolute',
        background: overlay || alpha(theme.palette.grey[900], 0.48),
      },
    };

    const content = (
      <Box
        component={LazyLoadImage as React.ElementType}
        //
        alt={alt}
        src={resolveContentImage(typeof src === 'string' ? src : '')}
        afterLoad={afterLoad}
        delayTime={delayTime}
        threshold={threshold}
        beforeLoad={beforeLoad}
        delayMethod={delayMethod}
        onError={handleError}
        placeholder={placeholder}
        wrapperProps={wrapperProps}
        scrollPosition={scrollPosition}
        visibleByDefault={visibleByDefault}
        effect={disabledEffect ? undefined : effect}
        useIntersectionObserver={useIntersectionObserver}
        wrapperClassName={wrapperClassName || 'component-image-wrapper'}
        placeholderSrc={placeholderSrc}
        //
        sx={{
          width: 1,
          height: 1,
          objectFit: 'cover',
          verticalAlign: 'bottom',
          ...(!!ratio && {
            top: 0,
            left: 0,
            position: 'absolute',
          }),
        }}
      />
    );

    return (
      <Box
        ref={ref}
        component="span"
        className="component-image"
        sx={{
          overflow: 'hidden',
          position: 'relative',
          verticalAlign: 'bottom',
          display: 'inline-block',
          ...(!!ratio && {
            width: 1,
          }),
          '& span.component-image-wrapper': {
            width: 1,
            height: 1,
            verticalAlign: 'bottom',
            backgroundSize: 'cover !important',
            ...(!!ratio && {
              pt: getRatio(ratio),
            }),
          },
          ...overlayStyles,
          ...sx,
        }}
        {...other}
      >
        {content}
      </Box>
    );
  }
);

Image.displayName = 'Image';

export default Image;
