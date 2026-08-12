import { forwardRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { alpha, useTheme } from '@mui/material/styles';

import { ImageProps } from './types';
import { getRatio } from './utils';

import { applyDefaultContentImage, resolveContentImage } from 'src/constants/images';

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
      placeholderSrc,
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
    const resolvedSrc = resolveContentImage(typeof src === 'string' ? src : '');
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
    const isLoading = loadedSrc !== resolvedSrc;

    const handleAfterLoad: NonNullable<ImageProps['afterLoad']> = () => {
      setLoadedSrc(resolvedSrc);
      afterLoad?.();
    };

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
        src={resolvedSrc}
        afterLoad={handleAfterLoad}
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
          opacity: isLoading ? 0 : 1,
          transition: theme.transitions.create('opacity', {
            duration: theme.transitions.duration.shorter,
          }),
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
            zIndex: 1,
            position: 'relative',
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
        {isLoading && (
          <Skeleton
            aria-hidden
            animation="wave"
            variant="rectangular"
            sx={{ position: 'absolute', inset: 0, width: 1, height: 1 }}
          />
        )}
        {content}
      </Box>
    );
  }
);

Image.displayName = 'Image';

export default Image;
