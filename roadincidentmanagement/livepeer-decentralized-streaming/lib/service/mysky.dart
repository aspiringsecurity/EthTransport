import 'dart:html';

import 'package:simple_observable/simple_observable.dart';
import 'package:skynet/mysky.dart';
import 'package:skynet/skynet.dart';
// import 'package:skynet/mysky.dart';
import 'package:skynet/dacs.dart';
import 'package:skynet/src/mysky/wrapper.dart';

class MySkyService {
  final SkynetClient skynetClient;

  MySkyService(this.skynetClient);

  final MySky mySky = MySky();

  late SocialDAC socialDAC;

  final isLoggedIn = Observable<bool?>(initialValue: null);

  String? userId;
  final String dataDomain = 'lisky.hns';

  Future<void> init() async {
    print('Using portal ${skynetClient.portalHost}');

    print('DATA_DOMAIN $dataDomain');

    socialDAC = SocialDAC(skynetClient);

    await mySky.load(
      dataDomain,
      skynetClient: skynetClient,
    );

    print('loaded MySky');

    await mySky.loadDACs([socialDAC]);

    print('loaded DACs');

    while (true) {
      try {
        final loggedIn = await mySky.checkLogin();

        print('loggedIn $loggedIn');

        if (loggedIn) {
          userId = await mySky.userId();
          print('userId $userId');
        }

        isLoggedIn.setValue(loggedIn);
        break;
      } catch (e) {
        // print(e);
      }
      await Future.delayed(Duration(milliseconds: 200));
    }
  }

// Only do when checkLogin is false and user presses button
  Future<void> requestLoginAccess() async {
    final res = await mySky.requestLoginAccess();

    if (res == true) {
      userId = await mySky.userId();
      isLoggedIn.setValue(true);
    }
  }
}
