import * as React from 'react';

interface Props {
  src: string;
  targetTime: number;
}

interface State {
  targetTime: number;
}

export default class extends React.Component<Props, State> {
  video: HTMLVideoElement;
  interval: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);

    this.state = {
      targetTime: props.targetTime || 0
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (typeof nextProps.targetTime !== 'undefined') {
      this.setState(() => ({
        targetTime: nextProps.targetTime
      }));
    }
  }

  public componentDidMount() {
    this.interval = setInterval(() => {
      const timeDifference = Math.abs(this.state.targetTime - this.video.currentTime);

      if (timeDifference < 0.2) {
        this.video.pause();
        this.video.currentTime = this.state.targetTime;
      } else {
        if (this.state.targetTime > this.video.currentTime) {
          this.video.play();
        } else {
          this.video.currentTime -= 0.1;
          this.video.pause();
        }
      }
    }, 50);

    this.video.msRealTime = true;
  }

  public componentWillUnmount() {
    clearInterval(this.interval);
  }

  public render() {
    const { src } = this.props;

    return (
      <div>
        <video ref={el => (this.video = el)} src={src} muted />
      </div>
    );
  }
}
