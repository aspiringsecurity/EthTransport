import 'dart:convert';
import 'dart:html';
import 'dart:js';

import 'package:http/http.dart' as http;
import 'package:lisky_live_streaming/js/dplayer.dart';
import 'package:lisky_live_streaming/js/js.dart';
import 'package:lisky_live_streaming/service/mysky.dart';
import 'package:skynet/dacs.dart';
import 'package:skynet/skynet.dart';
import 'package:uuid/uuid.dart';

final skynetClient = SkynetClient();
final profileDAC = ProfileDAC(skynetClient);

final streamHeader = document.getElementById('streamHeader')!;
final streamHeaderOffline = document.getElementById('streamHeaderOffline')!;
final streamerProfile = document.getElementById('streamerProfile')!;
final ownProfile = document.getElementById('ownProfile')!;

final signInButton = document.getElementById('signInButton')!;
final startLivestreamButton = document.getElementById('startLivestreamButton')!;
final startLivestreamModal = document.getElementById('startLivestreamModal')!;
final followButton = document.getElementById('followButton')!;
final unfollowButton = document.getElementById('unfollowButton')!;

String? currentUserId;

int since = 0;

final mySky = MySkyService(skynetClient);

Map<String, Map?> followingStatusCache = {};

late SkynetUser publicUser;

late String localUserKey;

final ownLivestreamStatus = <String, dynamic>{
  "status": "live", // "none"
  "ts": DateTime.now().millisecondsSinceEpoch,
  "since": 0,
  "live": {
    "title": "",
    "category": "",
    "topics": [],
    "lang": "en",
    "lastChanged": 0,
    "chat":
        "skychat://4a964fa1cb329d066aedcf7fc03a249eeea3cf2461811090b287daaaec37ab36/livestream",
    "viewerCount": 1,
    "stream": {
      "url": '',
      "type": "hls",
    }
  }
};

main(List<String> args) async {
  SkynetUser.createFromSeedAsync(List.generate(32, (index) => 0))
      .then((value) => publicUser = value);

  // TODO Rotate this key every hour
  localUserKey = window.localStorage['localUserKey'] ?? Uuid().v4();
  window.localStorage['localUserKey'] = localUserKey;

  signInButton.addEventListener('click', (event) {
    mySky.requestLoginAccess();
  });

  startLivestreamButton.addEventListener('click', (event) {
    startLivestreamModal.style.display = 'block';
    final href =
        'https://lisky.hns.${mySky.skynetClient.portalHost}/user/${mySky.userId}';
    final element = document.getElementById('streamLink')!;
    element.attributes['href'] = href;
    element.text = href;
  });

  followButton.addEventListener('click', (event) async {
    setFollowButtons(null);
    await mySky.socialDAC.follow(currentUserId!);
    setFollowButtons(true);
    followingStatusCache[currentUserId!] = statusCache;
    renderSidebar();
  });

  unfollowButton.addEventListener('click', (event) async {
    setFollowButtons(null);
    await mySky.socialDAC.unfollow(currentUserId!);
    setFollowButtons(false);
    followingStatusCache.remove(currentUserId);
    renderSidebar();
  });

  setupStartLivestreamInputFields();

  mySky.isLoggedIn.values.listen((event) {
    if (event == true) {
      signInButton.style.display = 'none';
      startLivestreamButton.style.display = 'flex';
      fetchFollowState(currentUserId);
      fetchFollowingList();
      renderOwnProfileData();
    } else if (event == false) {
      signInButton.style.display = 'flex';
      startLivestreamButton.style.display = 'none';
    }
  });
  mySky.init();
  print(window.location.pathname);
  final parts = window.location.pathname!.split('/user/');

  print(parts);
  if (parts.length > 1) {
    currentUserId = parts[1];
  }
  if (window.location.hostname == 'localhost') {
    currentUserId =
        'aa03562abc4e67bb8fa0114f1bfcc6de86a6af3047430016d5ed92a830a1622d';
  }

  if (currentUserId != null) {
    renderUser(currentUserId!);
  }
  renderSidebar();

  Stream.periodic(Duration(seconds: 1)).listen((event) {
    renderTime();
  });
  Stream.periodic(Duration(minutes: 5)).listen((event) {
    if (mySky.isLoggedIn.value == true) {
      fetchFollowingList();
    }
  });
}

void setupStartLivestreamInputFields() {
  final startLivestreamConfigTitle =
      document.getElementById('startLivestreamConfigTitle') as TextInputElement;
  startLivestreamConfigTitle.addEventListener('input', (event) {
    ownLivestreamStatus['live']['title'] = startLivestreamConfigTitle.value;
  });

  final startLivestreamConfigCategory = document
      .getElementById('startLivestreamConfigCategory') as TextInputElement;
  startLivestreamConfigCategory.addEventListener('input', (event) {
    ownLivestreamStatus['live']['category'] =
        startLivestreamConfigCategory.value;
  });

  final startLivestreamConfigTopics = document
      .getElementById('startLivestreamConfigTopics') as TextInputElement;
  startLivestreamConfigTopics.addEventListener('input', (event) {
    ownLivestreamStatus['live']['topics'] = startLivestreamConfigTopics.value!
        .split(',')
        .map((e) => e.trim())
        .toList();
  });

  final startLivestreamConfigStreamUrl = document
      .getElementById('startLivestreamConfigStreamUrl') as TextInputElement;

  startLivestreamConfigStreamUrl.addEventListener('input', (event) {
    ownLivestreamStatus['live']['stream']['url'] =
        startLivestreamConfigStreamUrl.value;
  });

  document
      .getElementById('startLivestreamButtonConfirm')!
      .addEventListener('click', (event) async {
    document.getElementById('startLivestreamButtonConfirm')!.style.display =
        'none';
    document.getElementById('ownStreamLink')!.style.display = 'block';

    ownLivestreamStatus['since'] = DateTime.now().millisecondsSinceEpoch;
    while (true) {
      ownLivestreamStatus['ts'] = DateTime.now().millisecondsSinceEpoch;
      print('set $ownLivestreamStatus');
      // try {
      await mySky.mySky.setJSON(
        'lisky.hns/status.json',
        ownLivestreamStatus,
      );
      /*  } catch (e, st) {
        print(e);
        print(st);
      } */
      await Future.delayed(Duration(seconds: 60));
    }
  });
}

void fetchFollowingList() async {
  print('fetchFollowingList');
  final following = await mySky.socialDAC.getFollowingForUser(mySky.userId!);
  print('getFollowingForUser: $following');
  for (final userId in following) {
    final status = await getStatusForUserId(userId);
    followingStatusCache[userId] = status;
  }
  renderSidebar();
}

Future<dynamic> getStatusForUserId(String userId) async {
  var status = await skynetClient.file.getJSON(userId, 'lisky.hns/status.json');

  if (status == null) {
    return {'status': 'none'};
  }
  final now = DateTime.now();

  if (now.difference(DateTime.fromMillisecondsSinceEpoch(status['ts'])) >
      Duration(minutes: 10)) {
    status['status'] = 'none';
  }
  return status;
}

void renderSidebar() async {
  final sidebar = document.getElementById('sidebar')!;
  var html = '';
  if (mySky.isLoggedIn.value == true) {
    print(followingStatusCache);
    for (final userId in followingStatusCache.keys) {
      final value = followingStatusCache[userId];
      if ((value ?? {})['status'] == 'live') {
        final profile = await profileDAC.getProfile(userId);
        if (profile != null) {
          try {
            if (html.isEmpty)
              html += '<span class="sidebarTitle">Following</span>';

            html +=
                '<div id="click-${userId}" class="profile-item"><img src="${skynetClient.resolveSkylink(profile.getAvatarUrl())}"> <div class="flex-column"><span class="username">${profile.username}</span><span class="category">${value!['live']['category']}</span></div></div>';
          } catch (e, st) {
            // TODO Better error handling
            print(e);
            print(st);
          }
        }
      }
    }
  }
  final userId =
      'aa03562abc4e67bb8fa0114f1bfcc6de86a6af3047430016d5ed92a830a1622d';
  if (!followingStatusCache.containsKey(userId)) {
    final profile = await profileDAC.getProfile(userId);
    html += '<span class="sidebarTitle">Recommended</span>';
    html +=
        '<div id="click-${userId}" class="profile-item"><img src="${skynetClient.resolveSkylink(profile!.getAvatarUrl())}"> <div class="flex-column"><span class="username">${profile.username}</span><span class="category">Music</span></div></div>';
  }
  sidebar.setInnerHtml(
    html,
    treeSanitizer: NodeTreeSanitizer(
      NodeValidator(
        uriPolicy: AllowSkylinksUrlPolicy(),
      ),
    ),
  );
  for (final profileItem in document.querySelectorAll('.profile-item')) {
    profileItem.addEventListener('click', (event) {
      currentUserId = profileItem.id.substring(6);
      renderUser(currentUserId!);
      window.history.pushState(
          'user/$currentUserId', '$currentUserId', '/user/$currentUserId');
    });
  }
}

class AllowSkylinksUrlPolicy implements UriPolicy {
  final AnchorElement _hiddenAnchor = new AnchorElement();
  final Location _loc = window.location;

  @override
  bool allowsUri(String uri) {
    _hiddenAnchor.href = uri;

    if (_hiddenAnchor.hostname == _loc.hostname) return true;
    // IE leaves an empty hostname for same-origin URIs.
    return (_hiddenAnchor.hostname == skynetClient.portalHost) ||
        (_hiddenAnchor.hostname == '' &&
            _hiddenAnchor.port == '' &&
            (_hiddenAnchor.protocol == ':' || _hiddenAnchor.protocol == ''));
  }
}

String? lastStatus;

void renderUser(String userId) async {
  print('renderUser');
  lastStatus = null;
  streamHeader.style.display = 'none';
  streamHeaderOffline.style.display = 'none';
  streamerProfile.style.display = 'none';

  followButton.style.display = 'none';
  unfollowButton.style.display = 'none';

  if (mySky.isLoggedIn.value == true) {
    fetchFollowState(userId);
  }

  renderProfileData(userId);
  fetchCurrentStatus(userId);

  Stream.periodic(Duration(minutes: 1)).listen((event) {
    if (userId != currentUserId) return; // TODO Improve
    fetchCurrentStatus(userId);
  });
}

void fetchFollowState(String? userId) async {
  if (userId == null) return;
  final res = await mySky.socialDAC.isFollowing(userId);
  if (userId != currentUserId) return;
  setFollowButtons(res);
}

void setFollowButtons(bool? value) {
  if (value == true) {
    followButton.style.display = 'none';
    unfollowButton.style.display = 'flex';
  } else if (value == false) {
    unfollowButton.style.display = 'none';
    followButton.style.display = 'flex';
  } else {
    unfollowButton.style.display = 'none';
    followButton.style.display = 'none';
  }
}

void renderTime() {
  if (lastStatus == 'live') {
    final diff =
        DateTime.now().difference(DateTime.fromMillisecondsSinceEpoch(since));
    document.getElementById('streamUptime')!.innerText =
        diff.toString().split('.')[0];
  }
}

void renderProfileData(userId) async {
  print('renderProfileData');
  final profile = await profileDAC.getProfile(userId);
  if (profile != null) {
    if (userId != currentUserId) return;
    document.getElementById('streamerUsername')!.innerText = profile.username;
    document.getElementById('streamerMeta')!.innerText = profile.location ?? '';
    (document.getElementById('streamerAvatar')! as ImageElement).src =
        skynetClient.resolveSkylink(profile.getAvatarUrl());

    streamerProfile.style.display = 'flex';
  }
}

void renderOwnProfileData() async {
  print('renderOwnProfileData');
  final profile = await profileDAC.getProfile(mySky.userId!);
  if (profile != null) {
    document.getElementById('ownUsername')!.innerText = profile.username;
    document.getElementById('ownMeta')!.innerText = profile.location ?? '';
    (document.getElementById('ownAvatar')! as ImageElement).src =
        skynetClient.resolveSkylink(profile.getAvatarUrl());

    ownProfile.style.display = 'flex';
  }
}

Map? statusCache;

void updateViewerCount(String userId) async {
  final path = 'lisky.hns/$userId/viewerCount.json';
  final res = await skynetClient.file.getJSONWithRevision(publicUser.id, path);
  if (userId != currentUserId) return;
  final now = DateTime.now();

  final Map map = res.data ?? {};
  map[localUserKey] = now.millisecondsSinceEpoch;
  int viewerCount = 0;

  final toRemove = <String>[];

  for (final viewer in map.entries) {
    final ts = DateTime.fromMillisecondsSinceEpoch(viewer.value);

    if (now.difference(ts) > Duration(minutes: 5)) {
      toRemove.add(viewer.key);
    } else {
      viewerCount++;
    }
  }

  document.getElementById('streamViewerCount')!.innerText =
      viewerCount.toString();

  map.removeWhere((key, value) => toRemove.contains(key));

  skynetClient.file.setJSON(
    publicUser,
    path,
    map,
    res.revision + 1,
  );
}

void fetchCurrentStatus(String userId) async {
  final status = await getStatusForUserId(userId);
  if (userId != currentUserId) return;
  updateViewerCount(userId);

  statusCache = status;

  if (status['status'] == 'live') {
    final liveStatus = status['live'];
    document.getElementById('streamTitle')!.innerText = liveStatus['title'];
    since = status['since'];
    renderTime();
    var html = '<span>${liveStatus['category']}</span>';
    for (final topic in liveStatus['topics']) {
      html += '<div>$topic</div>';
    }
    document.getElementById('streamTags')!.setInnerHtml(html);
    // category
    // topics and lang
  }

  if (lastStatus != status['status']) {
    streamHeader.style.display = 'none';
    streamHeaderOffline.style.display = 'none';
    // streamerProfile.style.display = 'none';
    document.getElementById('chatWindow')!.style.display = 'none';

    if (status['status'] == 'live') {
      document.getElementById('chatWindow')!.style.display = 'block';
      streamHeader.style.display = 'flex';
      setLiveStream(userId, status);
    } else {
      streamHeaderOffline.style.display = 'flex';
    }
  }
  lastStatus = status['status'];
}

void setLiveStream(String userId, Map status) async {
  final liveStatus = status['live'];

  final desc = document.getElementById('streamDescription');

  if (liveStatus['chat'] != null) {
    final chatUri = Uri.parse(liveStatus['chat']);

    final skyChatUrl =
        'https://chatbubble.hns.siasky.net/#minimal/${chatUri.host}${chatUri.path}';

    print(skyChatUrl);
    (document.getElementById('chatWindow') as IFrameElement).src = skyChatUrl;
  } else {
    // TODO Disable chat
  }

  final uri = Uri.parse(liveStatus['stream']['url']);

  final qualities = [];

  final res = await http.get(uri);

  print(res.body);

  for (final line in res.body.split('\n#EXT-X-STREAM-INF:').sublist(1)) {
    final parts = line.split('\n');
    final quality = parts[0]; // .split('RESOLUTION=').last.split(',').first;
    print(quality);

    final map = <String, String>{};

    for (final q in quality.split(',')) {
      final index = q.indexOf('=');
      if (index == -1) continue;
      map[q.substring(0, index)] = q.substring(index + 1);
    }

    // BANDWIDTH=662720,RESOLUTION=640x360,FRAME-RATE=30,CODECS="avc1.4d401e,mp4a.40.2"
    final str =
        '${map['RESOLUTION']}@${map['FRAME-RATE']}fps (${(int.parse(map['BANDWIDTH']!) / 1000).round()}k)';

    qualities.add(DPlayerQuality(
      name: str, // qualities.isEmpty ? '$resolution (source)' : resolution,
      url: uri.resolve(parts[1].trim()).toString(),
      type: 'hls',
    ));
  }
  print(qualities);

  final dplayer = DPlayer(
    DPlayerSettings(
      container: document.getElementById('dplayer'),
      autoplay: true,
      theme: '#00C65E',
      screenshot: false,
      airplay: true,
      hotkey: true,
      live: true,
      danmaku: false,
      // contextmenu: [],
      video: DPlayerVideoSettings(
        /* url: '',
        type: 'hls', */
        quality: qualities,
        defaultQuality: 0,
      ),
    ),
  );

  windowDPlayer = dplayer;
  dplayer.on('play', allowInterop((val) {
    print('play $val');

    print(dplayer.video.duration);
    dplayer.seek(dplayer.video.duration - 10);
  }));

  for (int i = 0; i < 20; i++) {
    if (!dplayer.paused) break;
    print('paused');
    dplayer.play();
    await Future.delayed(Duration(milliseconds: 100));
  }

  document.querySelector('.dplayer-quality-mask')!.style.width = '200px';
  document.querySelector('.dplayer-quality-list')!.style.width = '200px';

/* TODO for chat messages

  dplayer.danmaku.draw({
    text: 'username: Hello, world!',
    color: '#fff',
    type: 'right',
}) */
}
