# Music Charm Spotify V1

Bu paket şunları tek sistemde yapar:
- gerçek Spotify şarkı adı / sanatçı / progress
- gerçek albüm kapağı (backend baseline JPEG'e dönüştürür)
- telefon tarayıcısından Spotify yetkilendirmesi
- cihazdaki Spotify servis seçimini gerçek adapter'a bağlama
- play/pause/next/previous backend uçları

## Arduino
Library Manager:
- ArduinoJson (Benoit Blanchon)
- TJpg_Decoder (Bodmer)

Board: XIAO_ESP32S3
driver.h: #define BOARD_SCREEN_COMBO 501

## Spotify Developer Dashboard
Bir app oluştur.
Redirect URI:
https://SENIN-NETLIFY-SITEN.netlify.app/.netlify/functions/callback

Client ID ve Client Secret'i al.

## Netlify environment variables
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
SITE_URL=https://SENIN-NETLIFY-SITEN.netlify.app

## Firmware'de doldur
WIFI_PASSWORD
BACKEND_BASE
DEVICE_KEY

DEVICE_KEY en az 20-30 karakterlik rastgele bir değer olsun.

## Eşleştirme
Netlify sitesini iPhone'da aç.
Aynı DEVICE_KEY'i gir.
Spotify'a bağlan.
Spotify'da bir şarkı çal.
Cihaz birkaç saniye içinde veriyi çekmeli.

## Serial test
C = servis menüsü
L/R = servis değiştir
M = seç
N = Now Playing
F = Spotify refresh
P = play/pause
< = previous
> = next

## Güvenlik
Spotify Client Secret'i ESP32 koduna koyma.
DEVICE_KEY ve Wi-Fi şifresini herkese açık paylaşma.
