@JS('window')
library dplayer;

import 'package:js/js.dart';

@JS('DPlayer')
class DPlayer {
  external bool get paused;
  external void play();
  external void seek(double position);
  external void on(String event, dynamic f);

  external Video get video;

  external DPlayer(DPlayerSettings settings);

  /* external bool get min;
  external String get title;

  external void setTitle(String title);
  external void minimize();
  external void focus();
  external void close(); */
}

@JS()
@anonymous
class Video {
  @JS('duration')
  external double get duration;
}

@JS()
@anonymous
class DPlayerSettings {
  external dynamic get container;
  external bool get autoplay;
  external String get theme;
  external bool get screenshot;
  external bool get airplay;
  external dynamic get video;
  external bool get hotkey;
  external bool get live;

  external factory DPlayerSettings({
    dynamic container,
    bool autoplay,
    String theme,
    bool screenshot,
    bool airplay,
    bool live,
    dynamic video,
    bool hotkey,
    dynamic contextmenu,
    bool danmaku,
  });
}

@JS()
@anonymous
class DPlayerVideoSettings {
  external String get url;
  external String get type;

  external factory DPlayerVideoSettings({
    String url,
    String type,
    dynamic quality,
    int defaultQuality,
  });
}

@JS()
@anonymous
class DPlayerQuality {
  external String get url;
  external String get type;

  external factory DPlayerQuality({
    String name,
    String url,
    String type,
  });
}
