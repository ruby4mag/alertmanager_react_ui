# Gzip Decompression Fix for ChatBot Streaming

## Issue
The chatbot was displaying garbled/corrupted text like:
```
�������Ḏ�0F�ݧ�N Mb���c�ᦹ�����w]|� �}D$Y��"�37F�P�Y��f?�eM�5ڛt��9�����m ��?s����8.R[��I�j��Q�?�?�Z�Ѹ���'�N���������D���0Fw��|�mB,m7FߡЫah!zM4�w7�8��� �Y 3S���T�ʈh��8�� qC]2 �OvJ:���V�v���#;�z�ݘ��M�W�s���8 5��x��x.��TVDչ��Z��������Dͱ�0F�OQ�9BL���ե�pM�"4Q�Z�w/u�x����?s���)C L�Sax�����2zB '�HL��S�\0�Um�de�p��u�X錳CT��8��������ؗ���Ry���ʔg���m[_���v�~�����Dͱ�0F�ݧ(��@��4�ֱ��6W)�X���w�88�m��B����Ge���&�ie�'� ��iȈ0~�S2I��(i�x�c۶�s�[��l|�8�K*?���F�5ā 5�Q ����=9�Qw.}�V;�������Dͱ�0F�O!��@�iL�9���&-B��BE|�R��|;x[&N�\8F@E���:�ȉ)2��Gh7��4I�j%��rh�F�V9�������3����p qz}�郠^���rZ��P����jLm�?������D��� w��|3$@�[�.>AZ~Mh������8^r�����13LKe�����8�� qC]2��OvJ&��%�orl�F�Ny�ݘ��M���sw���X�5�Q <^�<zr*+�n]�b�v^�������D��� w��|3$@�[�.n>�-���������8^r�����11�se����2W�'� u��gD?�1�$Ck��j�ˡi�:�wC6>@�5�_���݃*k�c��LoD%���x*��TDݺ��Z���������Dͽ�0��W!�!����]zG��ФҞB�x�._x����0s��SaTT�~�2A '�HL�=�>"@�ь���V����ZM�Զ�θv��y��P�!]_uS*� �/1����U��sNO�� (�z���(+�}?}����Dͱ�0F�OQ�9BSM�9���&mM����K]:8�m���8f�S�X�GZyZ�HO��� ~C�B�<��H�*�jY9ܪ���m�5�������Jן�{,� �/!����*����ʔgx�6Ω�1��;�������Dͱ�0F�O!��@S�9����-BEo�E|�R��|;��&��q.L�P�'��A �9"�(s�>!��ю�D�:��U�]u]K�(o}3$�[�������TXC�Z_����*��)��1/�5m���jg�q\������D���0F�>�|sIL�����w��Z�����K]:8���?B��T 0���2"�y� P�SN�w�5Ӑa�d�d��(i�8˱m[�:���l|�8�[*�|?4��*k�s5�LoD%���x)��T��u!諵�{�/�����D���0Fw��|s���П���w(���D�����FǓ����?+!ba*�2"�qʉ�z�4fD?�9�$�3JZ5]�Զ�t����S6>@�9�_~��J�5ık�7�x��x)��TVD��tg�v]��/�����Dͽ�0��W!ߜ@���]zќ��ҞBE��R��/�����A�X��2UFDC�� P�SN�w�5Әa�l�d��(i�t�S۶���[�O���q��T~�06Ý*k�Sk��x��?x)��T���!��Z���8._�����D���0Fw��|s���ҟ���'p)�jZ�^ �ݍ,�'99gVB��T 0-��2"�+ P�SN�7�%Ӑa�d�d��(i�x�c۶�u�[ߍ���q��T~�~h�;U��i��ވJ���ГSY��B�gk��f�O_�����D���0Fw�B�9�$���Vt��;��U:$-z����.����B���ƹ2UF���B�rℸ�Ι���G;&�dpFI�������U��v���ݿ��w���Se ����鍨���=9�Q�6}�V;o�������D���0Fw�B�9���&�:f���*���R��b��s6�g%D�L�Ҙ#BB��9#nhK�Ta��l��Qҩ�&Gk��;���b|�8�k�����Ýk��Z�7�x��x���\WD�w!�s�+��/�����D���0Ew��ܹM�R�����?<��0�}&¿\Orr�����Y�@aZ�p$X(�$���.���&?�#;g�7�M�M��5��v�.D���r����߹ʑ<>C��F2�W��̅�BeE�]��xo���~�����D���0Fw��|s��Oh�1��.�^ C�k�!�����$'�l��B���ƹ2UF���8�� qC�3�ƏnL&��%��r��ʶQ��f���ÿ��w��{Pe q���鍨�W�O���ʂ��&}qN{�������D���0Fw��|s��Oh�1���^����5�����x��s6�g%D�L�R�*#��;A���8!n�K�!#���M�$:��S�U��Zٵ�;ߎ���q��T~�~h�U��j��ވJ���ГSYu׆���i�Ծ�������Dͱ� E�Oa� Ust�;��10�ߴ��ݛ�t<�I���"� c�3���ʺ�גg0�H>x�p;r �pPfԣW��V ��0�k�6�h�Av�7�H�W�3I��s�o8�p�В�|��d�X+�ZK��q\������Dͱ�0F�O!���Tc6G��Í�-����E|�R��|;�0<&��q��Y�Q�a��E2�y�Bb�HB�;�y��0n�#*��T��½u]�mS9�����F���C�?8��:�!G�W�3�C�ěPZ�u�t��Z����q�����D��� w���fH�"��]|ZM���Q��ݍ]/��m�ϝ13LKe����E+A���8!n�K�!#���N�$:��U�U�m���)o�����/������7��!��P3������ЃS�#�΅���j�ܾ�������D���0Ew��ܹM�RK����?<��0�}&¿YOrr��� �p�¼V�Hhe�Ba�LBH�y�Hpq�39�}��f��m[�}Sv��:��_���U,��k�7�Qx��d)�w$ۅ��g�ma�O_�����D���0Ew��ܹMJ��vcd�X}�>�> �ߍ,�'99g�|VB�,T�0-,Ă�8��P($)'I�x��gDX?�)٤Ck�vf�鱮k�6�;ߌ���u��T��?wwb���WϙވF���?�\�)���UۄP]����������D���0Ew��ܹM�R�#��P��0�}&¿YOrr�����Y�@aZ�pDh(���$� u�<dD8���\ҡsF{3���4��ZC��1;P�M���s�*��5��(<^�2J*+�����{KD������Dͽ�0��ݫ �\��
```

## Root Cause
The backend proxy was sending **gzip-compressed** responses, but the frontend was trying to decode the compressed binary data directly as text without decompressing it first.

When you read a compressed stream with `TextDecoder`, you get garbled binary data instead of the actual text content.

## Solution
Added decompression logic using the browser's built-in `DecompressionStream` API to handle gzip-compressed responses.

### Changes Made to `/opt/alertninja/alertmanager_react_ui/src/components/ChatBot.js`

#### 1. Init Streaming (Lines 120-130)
**Before:**
```javascript
if (!response.body) throw new Error('ReadableStream not supported.');

const reader = response.body.getReader();
const decoder = new TextDecoder();
let aiResponseText = '';
```

**After:**
```javascript
if (!response.body) throw new Error('ReadableStream not supported.');

// Handle gzip-compressed responses
const contentEncoding = response.headers.get('content-encoding');
let stream = response.body;

// Decompress if gzipped
if (contentEncoding === 'gzip') {
    stream = stream.pipeThrough(new DecompressionStream('gzip'));
}

const reader = stream.getReader();
const decoder = new TextDecoder();
let aiResponseText = '';
```

#### 2. Chat Message Streaming (Lines 229-239)
Same decompression logic added to the chat message streaming section.

---

## How It Works

### Before (Broken):
```
Backend → Gzip Compressed Stream → TextDecoder → Garbled Binary ❌
```

### After (Fixed):
```
Backend → Gzip Compressed Stream → DecompressionStream → Uncompressed Text → TextDecoder → Readable Text ✅
```

### Technical Details:

1. **Check Content-Encoding Header**
   ```javascript
   const contentEncoding = response.headers.get('content-encoding');
   ```
   - The backend sets `Content-Encoding: gzip` when sending compressed data

2. **Conditionally Decompress**
   ```javascript
   if (contentEncoding === 'gzip') {
       stream = stream.pipeThrough(new DecompressionStream('gzip'));
   }
   ```
   - Only decompress if the response is actually gzipped
   - Uses the browser's native `DecompressionStream` API (supported in modern browsers)

3. **Read Decompressed Stream**
   ```javascript
   const reader = stream.getReader();
   const decoder = new TextDecoder();
   ```
   - Now reads the decompressed text data
   - TextDecoder can properly convert it to strings

---

## Browser Compatibility

`DecompressionStream` is supported in:
- ✅ Chrome 80+
- ✅ Edge 80+
- ✅ Firefox 113+
- ✅ Safari 16.4+

For older browsers, you would need a polyfill like `pako.js`, but modern browsers all support it natively.

---

## Testing

### Before Fix:
```
User: [Opens chatbot]
AI: �������Ḏ�0F�ݧ�N Mb���c�ᦹ�����w]|� �}D$Y��"�37F�P�Y��f?�eM�5ڛt��9�����m ��?s����8.R[��I�j��Q�?�?�Z�Ѹ���'�N���������D���0Fw��|�mB,m7FߡЫah!zM4�w7�8��� �Y 3S���T�ʈh��8�� qC]2 �OvJ:���V�v���#;�z�ݘ��M�W�s���8 5��x��x.��TVDչ��Z��������Dͱ�0F�OQ�9BL���ե�pM�"4Q�Z�w/u�x����?s���)C L�Sax�����2zB '�HL��S�\0�Um�de�p��u�X錳CT��8��������ؗ���Ry���ʔg���m[_���v�~�����Dͱ�0F�ݧ(��@��4�ֱ��6W)�X���w�88�m��B����Ge���&�ie�'� ��iȈ0~�S2I��(i�x�c۶�s�[��l|�8�K*?���F�5ā 5�Q ����=9�Qw.}�V;�������Dͱ�0F�O!��@�iL�9���&-B��BE|�R��|;x[&N�\8F@E���:�ȉ)2��Gh7��4I�j%��rh�F�V9�������3����p qz}�郠^���rZ��P����jLm�?������D��� w��|3$@�[�.>AZ~Mh������8^r�����13LKe�����8�� qC]2��OvJ&��%�orl�F�Ny�ݘ��M���sw���X�5�Q <^�<zr*+�n]�b�v^�������D��� w��|3$@�[�.n>�-���������8^r�����11�se����2W�'� u��gD?�1�$Ck��j�ˡi�:�wC6>@�5�_���݃*k�c��LoD%���x*��TDݺ��Z���������Dͽ�0��W!�!����]zG��ФҞB�x�._x����0s��SaTT�~�2A '�HL�=�>"@�ь���V����ZM�Զ�θv��y��P�!]_uS*� �/1����U��sNO�� (�z���(+�}?}����Dͱ�0F�OQ�9BSM�9���&mM����K]:8�m���8f�S�X�GZyZ�HO��� ~C�B�<��H�*�jY9ܪ���m�5�������Jן�{,� �/!����*����ʔgx�6Ω�1��;�������Dͱ�0F�O!��@S�9����-BEo�E|�R��|;��&��q.L�P�'��A �9"�(s�>!��ю�D�:��U�]u]K�(o}3$�[�������TXC�Z_����*��)��1/�5m���jg�q\������D���0F�>�|sIL�����w��Z�����K]:8���?B��T 0���2"�y� P�SN�w�5Ӑa�d�d��(i�8˱m[�:���l|�8�[*�|?4��*k�s5�LoD%���x)��T��u!諵�{�/�����D���0Fw��|s���П���w(���D�����FǓ����?+!ba*�2"�qʉ�z�4fD?�9�$�3JZ5]�Զ�t����S6>@�9�_~��J�5ık�7�x��x)��TVD��tg�v]��/�����Dͽ�0��W!ߜ@���]zќ��ҞBE��R��/�����A�X��2UFDC�� P�SN�w�5Әa�l�d��(i�t�S۶���[�O���q��T~�06Ý*k�Sk��x��?x)��T���!��Z���8._�����D���0Fw��|s���ҟ���'p)�jZ�^ �ݍ,�'99gVB��T 0-��2"�+ P�SN�7�%Ӑa�d�d��(i�x�c۶�u�[ߍ���q��T~�~h�;U��i��ވJ���ГSY��B�gk��f�O_�����D���0Fw�B�9�$���Vt��;��U:$-z����.����B���ƹ2UF���B�rℸ�Ι���G;&�dpFI�������U��v���ݿ��w���Se ����鍨���=9�Q�6}�V;o�������D���0Fw�B�9���&�:f���*���R��b��s6�g%D�L�Ҙ#BB��9#nhK�Ta��l��Qҩ�&Gk��;���b|�8�k�����Ýk��Z�7�x��x���\WD�w!�s�+��/�����D���0Ew��ܹM�R�����?<��0�}&¿\Orr�����Y�@aZ�p$X(�$���.���&?�#;g�7�M�M��5��v�.D���r����߹ʑ<>C��F2�W��̅�BeE�]��xo���~�����D���0Fw��|s��Oh�1��.�^ C�k�!�����$'�l��B���ƹ2UF���8�� qC�3�ƏnL&��%��r��ʶQ��f���ÿ��w��{Pe q���鍨�W�O���ʂ��&}qN{�������D���0Fw��|s��Oh�1���^����5�����x��s6�g%D�L�R�*#��;A���8!n�K�!#���M�$:��S�U��Zٵ�;ߎ���q��T~�~h�U��j��ވJ���ГSYu׆���i�Ծ�������Dͱ� E�Oa� Ust�;��10�ߴ��ݛ�t<�I���"� c�3���ʺ�גg0�H>x�p;r �pPfԣW��V ��0�k�6�h�Av�7�H�W�3I��s�o8�p�В�|��d�X+�ZK��q\������Dͱ�0F�O!���Tc6G��Í�-����E|�R��|;�0<&��q��Y�Q�a��E2�y�Bb�HB�;�y��0n�#*��T��½u]�mS9�����F���C�?8��:�!G�W�3�C�ěPZ�u�t��Z����q�����D��� w���fH�"��]|ZM���Q��ݍ]/��m�ϝ13LKe����E+A���8!n�K�!#���N�$:��U�U�m���)o�����/������7��!��P3������ЃS�#�΅���j�ܾ�������D���0Ew��ܹM�RK����?<��0�}&¿YOrr��� �p�¼V�Hhe�Ba�LBH�y�Hpq�39�}��f��m[�}Sv��:��_���U,��k�7�Qx��d)�w$ۅ��g�ma�O_�����D���0Ew��ܹMJ��vcd�X}�>�> �ߍ,�'99g�|VB�,T�0-,Ă�8��P($)'I�x��gDX?�)٤Ck�vf�鱮k�6�;ߌ���u��T��?wwb���WϙވF���?�\�)���UۄP]����������D���0Ew��ܹM�R�#��P��0�}&¿YOrr�����Y�@aZ�pDh(���$� u�<dD8���\ҡsF{3���4��ZC��1;P�M���s�*��5��(<^�2J*+�����{KD������Dͽ�0��ݫ �\��
```

### After Fix:
```
User: [Opens chatbot]
AI: Hello! I'm analyzing this incident. Based on the alert data, I can see...
[Readable, properly formatted markdown text]
```

---

## Files Modified
- ✅ `/opt/alertninja/alertmanager_react_ui/src/components/ChatBot.js`

## Status
✅ **FIXED** - ChatBot now properly decompresses gzip-compressed streaming responses from the backend
