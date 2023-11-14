import * as React from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import { APP_THEME, COLORS } from "../../Style/colorScheme";
import styles from "../../Style/styles";
import SeekBar from "./SeekBar";

export default function SoundPlayer(props) {

  const sound = React.useRef(new Audio.Sound());
  const [Status, SetStatus] = React.useState(false); // isPlaying
  // Seekbar variables
  const [totalLength, setTotalLength] = React.useState(1);
  const [currentPos, setCurrentPos] = React.useState(0);
  const [intervalId, setIntervalId] = React.useState(0);

  // get audio length from sound
  const setDuration = (sound) => {
    setTotalLength(Math.floor(sound.durationMillis / 1000));
  };

  const setTime = (sound, pos) => {
    console.log("Set time: " + pos);
    sound.current.positionMillis = pos * 1000;
    setCurrentPos(Math.floor(pos));
  };

  const seek = (pos) => {
    console.log("Seeking " + pos);
    setCurrentPos(Math.floor(pos));
    sound.current.playFromPositionAsync(pos * 1000);
    SetStatus(true);
    clearInterval(intervalId);
    const interval = setInterval(updatePos, 300);
    setIntervalId(interval);
  };

  const updatePos = async () => {
    try {
      // is playing
      const result = await sound.current.getStatusAsync();
      if (result.isPlaying) {
        // console.log("New time: " + result.positionMillis / 1000);
        setCurrentPos(Math.floor(result.positionMillis / 1000));
      }
      else if (!result.isPlaying && result.positionMillis == result.durationMillis) {
        // console.log("End of sound")
        setCurrentPos(totalLength);
        SetStatus(false);
        clearInterval(intervalId);
      }
    }
    catch (error) {
      clearInterval(intervalId);
    }
  }

  const LoadAudio = async () => {

    shiftedURI = props.getShiftedURI();

    if (shiftedURI === "NOT SET"){

      console.log("Attempting to load before audio is recorded!");

    }

    else{

      try {

        console.log("props.shiftedURI = " + shiftedURI);

        await sound.current.unloadAsync();

        let result = await sound.current.loadAsync({uri: shiftedURI});
        console.log(sound.current);
        setTime(sound, 0);
        setDuration(result);
        if (result.isLoaded === false) {
          console.log("Error in Loading Audio");
        } else {
          await PlayAudio();
        }
      } catch (error) {
        console.log("Error in Loading Audio: " + error);
      }
    }
  };

  const PlayAudio = async () => {
    try {
      const result = await sound.current.getStatusAsync();
      if (result.isLoaded) {
        if (result.isPlaying === false) {
          sound.current.playFromPositionAsync(currentPos * 1000);
          SetStatus(true);
          const interval = setInterval(updatePos, 300);
          setIntervalId(interval);
          console.log("Audio playing");
        }
      } else {
        LoadAudio();
      }
    } catch (error) {
      SetStatus(false);
    }
  };

  const PauseAudio = async () => {
    try {
      const result = await sound.current.getStatusAsync();
      if (result.isLoaded) {
        if (result.isPlaying === true) {
          sound.current.pauseAsync();
          SetStatus(false);
          clearInterval(intervalId);
          console.log("Audio paused");
        }
      }
    } catch (error) {
      SetStatus(false);
    }
  };

  const StopAudio = async () => {
    try {
      sound.current.stopAsync();
      SetStatus(false);
      setTime(sound, 0);
      clearInterval(intervalId);
      console.log("Audio stopped");
    } catch (error) {
      SetStatus(false);
    }
  };

  const ReplayAudio = async () => {
    try {
      LoadAudio();
      sound.current.replayAsync();
      SetStatus(true);
      setTime(sound, 0);
      const interval = setInterval(updatePos, 300);
      setIntervalId(interval);
      console.log("Audio replaying");
    } catch (error) {
      SetStatus(false);
    }
  };

  return (
    <View>
      <View style={styles.progressBar}>
        <SeekBar
          onSlidingStart={() => PauseAudio()}
          onSeek={(value) => seek(value)}
          trackLength={totalLength}
          currentPosition={currentPos}
        />
      </View>

      <View style={[styles.row, { justifyContent: "space-around" }]}>
        <TouchableOpacity
          onPress={Status === false ? () => PlayAudio() : () => PauseAudio()}
          style={styles.circleButton}
        >
          <Image
            source={
              Status === false
                ? require("../../images/play.png")
                : require("../../images/pause.png")
            }
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={StopAudio} style={[styles.circleButton]}>
          <Image source={require("../../images/stop.png")} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={ReplayAudio} style={styles.circleButton}>
          <Image
            source={require("../../images/replay-music.png")}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}