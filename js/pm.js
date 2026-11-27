/*
 * Bảo trì bảo dưỡng định kỳ quý (Quarterly Preventive Maintenance).
 *
 * Khác với checklist bàn giao (js/checklist.js – danh sách cố định), checklist bảo trì được NHÂN RA từ:
 *   1. Bộ đầu việc theo LOẠI thiết bị (KINDS bên dưới) – do Raitek tự định nghĩa.
 *   2. Hồ sơ thiết bị của từng dự án (site: khu vực + danh mục thiết bị) – lập một lần từ bản vẽ hoàn công.
 * Mỗi thiết bị thành một nhóm riêng (INV1, INV2, DB1...) nên thiếu thiết bị nào là thấy ngay.
 * Các nhóm xếp theo KHU VỰC theo đúng lộ trình đi tại hiện trường.
 *
 * Đầu việc:
 *   n    : số thứ tự trong loại thiết bị. KHÔNG đổi hay dùng lại số cũ: kết quả đã lưu gắn với mã <thiết bị>-<n>.
 *   t    : nội dung · g : nhóm con
 *   f    : tần suất – 'Q' mỗi quý (mặc định), 'H' 6 tháng, 'Y' hằng năm
 *   p    : số ảnh tối thiểu phải chụp · ph : hướng dẫn chụp ảnh (hiện ngay dưới nội dung)
 *   u    : đơn vị đo (bắt buộc ghi giá trị) · off : 1 = cần cắt điện
 *   multi: 'str' = đo từng string của thiết bị (một ô nhập cho mỗi string khai báo trong hồ sơ)
 *   i    : phần giải thích khi bấm nút "i" – lam (làm gì), cach (cách làm), vi (vì sao quan trọng), luu (lưu ý)
 *   form : dòng tương ứng trên mẫu checklist quý đang ký với chủ đầu tư (A1, B1–B3, C1–C3, D1, E1, F1–F2, G1–G2, H1–H2)
 *   opt  : chỉ áp dụng khi thiết bị có tùy chọn này (vd. 'fan' = tủ có quạt)
 *   x    : 1 = đã bỏ
 */
(function () {
  'use strict';

  const BEFORE = 'Chụp TRƯỚC khi động vào thiết bị. Giữ đúng góc này để chụp lại sau khi vệ sinh.';
  const AFTER = 'Chụp đúng góc của ảnh "trước vệ sinh" để so sánh được.';

  const KINDS = [
    {
      k: 'pre', pre: 'PRE', title: 'Chuẩn bị & an toàn', one: 'Chuẩn bị & an toàn', zone: 'Trước khi lên mái',
      tasks: [
        { n: 1, t: 'Dụng cụ đo đầy đủ và còn hạn hiệu chuẩn: ampe kìm DC, camera nhiệt, đồng hồ vạn năng, cờ lê lực', p: 1,
          ph: '1 ảnh: bày toàn bộ dụng cụ đo trên một mặt phẳng, thấy rõ tem hiệu chuẩn.',
          i: { cach: 'Kiểm tra pin, que đo, tem hiệu chuẩn của từng dụng cụ. Ampe kìm phải đo được dòng DC và đã chỉnh 0 trước khi dùng. Đợt có hạng mục năm thì mang thêm megaohm và máy đo điện trở tiếp địa.', vi: 'Số đo dòng string và nhiệt độ là căn cứ để kết luận thiết bị tốt hay hỏng. Dụng cụ hết hạn hiệu chuẩn thì số đo không có giá trị với chủ đầu tư.', luu: 'Thiếu dụng cụ thì ghi rõ ở ghi chú hạng mục nào không đo được, không ghi số ước lượng.' } },
        { n: 2, t: 'Đăng ký vào nhà máy; giấy phép làm việc trên cao và làm việc điện đã được ký', p: 1,
          ph: '1 ảnh: giấy phép làm việc đã ký hoặc sổ đăng ký ra vào.',
          i: { cach: 'Trình diện bảo vệ và người phụ trách của nhà máy. Thống nhất phạm vi làm việc, khung giờ được lên mái và khung giờ cắt điện nếu đợt này có hạng mục cần cắt điện.', vi: 'Làm việc khi chưa có giấy phép là vi phạm nội quy nhà máy và làm mất hiệu lực bảo hiểm khi có sự cố.', luu: 'Hạng mục cần cắt điện phải báo trước cho nhà máy, không tự ý thao tác.' } },
        { n: 3, t: 'Họp an toàn đầu ca, phân công; kiểm tra PPE: dây đai toàn thân, mũ, giày, găng cách điện', p: 1,
          ph: '1 ảnh: cả nhóm đã mặc đủ PPE trước khi lên mái.',
          i: { cach: 'Trưởng nhóm phổ biến nội dung công việc, các mối nguy hôm nay (tôn sáng, mép mái, điện DC luôn có điện khi trời sáng), phân công người làm và người giám sát. Từng người tự kiểm tra dây đai, móc khóa, dây giảm sốc.', vi: 'Phần lớn tai nạn trên mái xảy ra do không móc dây an toàn hoặc bước lên tôn sáng.', luu: 'Dây đai có vết cắt, sờn hoặc đã từng chịu tải rơi thì không dùng.' } },
        { n: 4, t: 'Thời tiết phù hợp: mái khô, không mưa giông, gió nhẹ', p: 1,
          ph: '1 ảnh: bầu trời và mặt mái lúc bắt đầu làm việc.',
          i: { cach: 'Quan sát trời và mặt mái. Ghi thời tiết, bức xạ và nhiệt độ ở tab Thông tin.', vi: 'Mái ướt rất trơn. Đo dòng string và chụp nhiệt chỉ có ý nghĩa khi trời nắng ổn định.', luu: 'Có giông sét thì dừng toàn bộ công việc trên mái.' } }
      ]
    },
    {
      k: 'ladder', pre: 'L', title: 'Thang leo', one: 'Thang leo', zone: 'Mái',
      tasks: [
        { n: 1, t: 'Thang leo: liên kết vào kết cấu chắc chắn, bulong không lỏng, không rỉ sét, lồng bảo vệ nguyên vẹn', form: 'A1', p: 2,
          ph: '2 ảnh: 1 toàn cảnh thang từ dưới lên, 1 cận cảnh điểm liên kết vào tường hoặc chân thang.',
          i: { cach: 'Lắc thử thang trước khi leo. Nhìn từng điểm bắt vào tường, từng bậc, các vòng lồng bảo vệ. Kiểm tra mối hàn và lớp mạ.', vi: 'Thang là lối lên xuống duy nhất của cả nhóm và của người cấp cứu khi có sự cố.', luu: 'Thấy điểm liên kết lỏng hoặc rỉ thủng thì không leo, báo trưởng nhóm và ghi tồn tại mức A.' } },
        { n: 2, t: 'Cửa, khóa chống leo và biển cảnh báo tại chân thang', form: 'A1', p: 1,
          ph: '1 ảnh: chân thang thấy rõ khóa và biển cảnh báo.',
          i: { cach: 'Kiểm tra khóa còn dùng được, biển "Không phận sự miễn vào" còn đọc được.', vi: 'Người không phận sự leo lên mái là rủi ro tai nạn và mất trộm.', luu: 'Khóa lại ngay sau khi cả nhóm đã xuống.' } },
        { n: 3, t: 'Dây tiếp địa của thang: mối nối chắc, không đứt, không rỉ', p: 1,
          ph: '1 ảnh: điểm bắt dây tiếp địa vào thang.',
          i: { cach: 'Tìm dây tiếp địa ở chân thang, lắc nhẹ đầu cốt, xem bulong và dây.', vi: 'Thang kim loại nối liền mái là đường dẫn sét và dòng rò xuống đất.', luu: 'Thang không có dây tiếp địa thì chọn N/A và ghi chú.' } }
      ]
    },
    {
      k: 'roof', pre: 'R', title: 'Khu mái & dàn pin', one: 'Khu mái', zone: 'Mái',
      opts: { clean: 'Đợt này có vệ sinh tấm pin' },
      tasks: [
        { n: 1, g: 'Lối đi & an toàn', t: 'Lối đi (walkway): kẹp đủ, không võng, không rỉ, không xô lệch', form: 'A1', p: 2,
          ph: '2 ảnh: 1 dọc theo tuyến lối đi, 1 cận cảnh kẹp giữ lối đi vào mái.',
          i: { cach: 'Đi hết các tuyến lối đi. Dẫm thử từng đoạn, nhìn kẹp và bulong, chú ý các đoạn nối.', vi: 'Lối đi lỏng hoặc gãy làm người rơi xuống tôn, tôn sáng.', luu: 'Chỉ đi trên lối đi và trên hàng vít xà gồ. Không bước lên tôn sáng.' } },
        { n: 2, g: 'Lối đi & an toàn', t: 'Lan can (handrail): trụ đứng chắc, thanh ngang không cong, bulong đủ', form: 'A1', p: 2,
          ph: '2 ảnh: 1 toàn tuyến lan can, 1 cận cảnh chân trụ.',
          i: { cach: 'Đẩy thử từng trụ lan can, kiểm tra chân trụ và các mối nối.', vi: 'Lan can là lớp bảo vệ cuối cùng ở mép mái.', luu: 'Không tựa người hay móc dây an toàn vào lan can.' } },
        { n: 3, g: 'Lối đi & an toàn', t: 'Dây cứu sinh và điểm neo: cáp không tưa, tăng đơ và kẹp cáp chắc, còn tem kiểm định', form: 'A1', p: 2,
          ph: '2 ảnh: 1 cận cảnh điểm neo đầu tuyến có tăng đơ và kẹp cáp, 1 dọc theo tuyến cáp.',
          i: { cach: 'Đi dọc tuyến cáp, vuốt găng theo cáp tìm sợi tưa. Kiểm tra tăng đơ, ốc siết cáp, các trụ trung gian và độ căng.', vi: 'Dây cứu sinh giữ mạng người khi trượt ngã. Cáp tưa hoặc kẹp lỏng không giữ được tải rơi.', luu: 'Phát hiện hư hỏng thì dừng dùng tuyến đó và ghi tồn tại mức A.' } },
        { n: 4, g: 'Tấm pin & khung', t: 'Kiểm tra và siết lại kẹp tấm pin (kẹp giữa, kẹp biên), bulong chân L', form: 'B1', p: 3,
          ph: '3 ảnh: 1 toàn cảnh dãy đã kiểm tra, 1 cận cảnh kẹp đang siết bằng cờ lê lực, 1 cận cảnh dấu sơn đánh dấu sau khi siết.',
          i: { cach: 'Mỗi quý lấy mẫu tối thiểu 10 % số kẹp và xoay vòng khu vực để một năm phủ hết mái. Siết bằng cờ lê lực theo lực của nhà sản xuất khung, đánh dấu sơn sau khi siết. Ghi dãy đã kiểm tra vào ghi chú.', vi: 'Kẹp lỏng do giãn nở nhiệt và gió làm tấm pin xô lệch, nứt cell, bão có thể thổi bay.', luu: 'Không siết quá lực vì làm nứt kính và biến dạng khung nhôm.' } },
        { n: 5, g: 'Tấm pin & khung', t: 'Rail, nối rail, chân L: không cong vênh, không rỉ, không xô lệch', form: 'B1', p: 2,
          ph: '2 ảnh: 1 nhìn dọc thanh rail, 1 cận cảnh chân L bắt xuống mái.',
          i: { cach: 'Nhìn dọc thanh rail tìm chỗ võng, lệch. Kiểm tra mối nối rail và vít bắt chân L xuống xà gồ.', vi: 'Khung giá đỡ chịu toàn bộ tải gió. Một chân lỏng dồn tải sang các chân bên cạnh.', luu: 'Rỉ ở vít bắt mái thường đi kèm thấm dột, kiểm tra luôn mục mái.' } },
        { n: 6, g: 'Tấm pin & khung', t: 'Bóng che: cây, ống khói, thiết bị mới lắp trên mái, rác, phân chim', form: 'B2', p: 2,
          ph: '2 ảnh: 1 toàn cảnh mái, 1 cận cảnh từng vật gây bóng che (nếu có).',
          i: { cach: 'Quan sát toàn mái, nhất là quanh quả cầu thông gió, ống khói, mép mái sát cây, các thiết bị nhà máy mới lắp.', vi: 'Một tấm bị che làm giảm dòng cả string và gây điểm nóng lâu dài.', luu: 'Bóng che thay đổi theo giờ và theo mùa. Ghi giờ quan sát vào ghi chú.' } },
        { n: 7, g: 'Tấm pin & khung', t: 'Đếm tấm pin hư hỏng: vỡ kính, nứt, cháy điểm, ố vàng, phồng mặt sau, hộp đấu dây; cô lập và đánh dấu trên bản vẽ', form: 'B3', u: 'tấm', p: 2,
          ph: 'Tối thiểu 2 ảnh toàn cảnh. Mỗi tấm hỏng thêm 2 ảnh: 1 cận cảnh vết hỏng, 1 ảnh thấy vị trí tấm trong dãy.',
          i: { cach: 'Đi hết các lối đi, quan sát mặt kính từng dãy. Ghi số tấm hỏng vào ô giá trị (không có thì ghi 0). Ghi vị trí theo inverter và string vào ghi chú, đánh dấu lên bản vẽ bố trí string.', vi: 'Tấm vỡ kính có nguy cơ rò điện, cháy và kéo sụt cả string. Số tấm hỏng là căn cứ làm bảo hành.', luu: 'Không chạm tay trần vào tấm vỡ khi trời sáng. Cô lập string trước khi xử lý.' } },
        { n: 8, g: 'Tấm pin & khung', t: 'Mức độ bám bẩn của tấm pin; đề xuất vệ sinh nếu cần', p: 2,
          ph: '2 ảnh: 1 toàn cảnh, 1 cận cảnh mặt kính ở khu vực bẩn nhất.',
          i: { cach: 'Quan sát mặt kính, chú ý mép dưới tấm pin và khu vực gần ống khói, quạt hút.', vi: 'Bụi làm giảm sản lượng. Bám bẩn lệch ở mép dưới gây điểm nóng.', luu: 'Ghi mức nhẹ, vừa hoặc nặng và khu vực vào ghi chú.' } },
        { n: 14, g: 'Tấm pin & khung', t: 'Tấm pin TRƯỚC khi vệ sinh', opt: 'clean', p: 2,
          ph: '2 ảnh: 1 toàn cảnh khu vực, 1 cận cảnh mặt kính. ' + BEFORE,
          i: { cach: 'Chụp hiện trạng trước khi phun nước. Chọn vị trí đứng dễ quay lại để chụp đúng góc sau khi vệ sinh.', vi: 'Ảnh trước và sau là bằng chứng khối lượng vệ sinh để nghiệm thu với chủ đầu tư.', luu: 'Vệ sinh lúc sáng sớm hoặc chiều mát. Không phun nước lạnh lên kính đang nóng.' } },
        { n: 15, g: 'Tấm pin & khung', t: 'Tấm pin SAU khi vệ sinh: sạch đều, không đọng cặn, không nứt vỡ do vệ sinh', opt: 'clean', p: 2,
          ph: '2 ảnh: 1 toàn cảnh, 1 cận cảnh mặt kính. ' + AFTER,
          i: { cach: 'Sau khi vệ sinh, kiểm tra lại mặt kính, mép dưới tấm pin và các đầu nối không bị kéo tuột.', vi: 'Xác nhận chất lượng vệ sinh và không gây hư hỏng mới.', luu: 'Dùng nước sạch và chổi mềm. Không dùng hóa chất, không đứng lên tấm pin.' } },
        { n: 9, g: 'Tấm pin & khung', t: 'Chụp nhiệt dàn pin: điểm nóng, diode bypass, string hở mạch', f: 'H', p: 3,
          ph: 'Tối thiểu 3 ảnh nhiệt toàn cảnh từng khu. Mỗi điểm bất thường thêm 1 ảnh nhiệt và 1 ảnh thường cùng vị trí.',
          i: { cach: 'Thực hiện khi bức xạ từ 600 W/m² trở lên và hệ thống đang phát. Quét từng dãy, góc nhìn lệch 5–60° so với pháp tuyến mặt kính để tránh phản xạ.', vi: 'Phát hiện cell hỏng, diode chết, string hở mạch mà mắt thường không thấy.', luu: 'Chênh trên 20 °C so với cell bên cạnh là bất thường, ghi vị trí tấm vào ghi chú.' } },
        { n: 10, g: 'Cáp trên mái', t: 'Cáp DC và đầu nối MC4: không võng chạm tôn, không đọng nước, dây rút và kẹp cáp còn tốt, ống luồn không giòn nứt, MC4 không chảy', form: 'E1', p: 3,
          ph: '3 ảnh: 1 dưới gầm dãy pin thấy cáp được cố định, 1 cận cảnh đầu nối MC4, 1 đoạn cáp vào máng.',
          i: { cach: 'Nhìn dưới gầm tấm pin dọc các dãy. Kiểm tra dây rút, kẹp cáp, các đầu MC4 và đoạn cáp đi vào máng.', vi: 'Cáp cọ vào tôn bị mòn vỏ gây chạm đất, hồ quang và cháy. MC4 lỏng hoặc lai hãng là nguyên nhân cháy phổ biến nhất trên mái.', luu: 'Không rút MC4 khi string đang mang tải.' } },
        { n: 11, g: 'Cáp trên mái', t: 'Máng cáp trên mái: nắp đủ, không rỉ, có dây liên kết tiếp địa; không có tổ chim, chuột', form: 'E1', p: 2,
          ph: '2 ảnh: 1 dọc tuyến máng, 1 cận cảnh mối nối máng có dây tiếp địa.',
          i: { cach: 'Đi dọc tuyến máng. Mở nắp kiểm tra ngẫu nhiên vài vị trí, xem bên trong có nước, tổ chim, vết chuột cắn.', vi: 'Máng hở nắp làm cáp lão hóa nhanh do nắng và là nơi chuột, chim làm tổ.', luu: 'Đậy và cài lại nắp sau khi kiểm tra.' } },
        { n: 12, g: 'Cáp trên mái', t: 'Tiếp địa khung, rail, tấm pin, máng cáp, lối đi: lá tiếp địa và kẹp tiếp địa đủ, dây không đứt', f: 'H', p: 2,
          ph: '2 ảnh: 1 cận cảnh kẹp tiếp địa trên rail, 1 dây tiếp địa nối máng cáp hoặc lối đi.',
          i: { cach: 'Kiểm tra ngẫu nhiên các điểm nối tiếp địa trên rail, giữa các đoạn máng, lối đi.', vi: 'Tiếp địa đứt làm khung mang điện khi có rò, gây giật và inverter báo lỗi cách điện.', luu: 'Mất nhiều điểm thì đề xuất đo thông mạch tiếp địa.' } },
        { n: 13, g: 'Mái', t: 'Mái không thấm dột tại vị trí bắt vít, kẹp; máng xối không tắc', p: 2,
          ph: '2 ảnh: 1 máng xối, 1 cận cảnh vị trí vít hoặc kẹp bắt xuống mái.',
          i: { cach: 'Quan sát keo chống thấm tại vít, tình trạng tôn quanh chân L, rác trong máng xối. Hỏi nhà máy có điểm dột mới không.', vi: 'Dột gây thiệt hại hàng hóa bên dưới và là khiếu nại hay gặp nhất của chủ nhà xưởng.', luu: 'Điểm dột cần ảnh cả trên mái và dưới xưởng nếu được phép.' } }
      ]
    },
    {
      k: 'ws', pre: 'WS', title: 'Trạm thời tiết & cảm biến', one: 'Trạm thời tiết', zone: 'Mái',
      tasks: [
        { n: 1, t: 'Cảm biến bức xạ và cảm biến nhiệt độ TRƯỚC khi vệ sinh', form: 'G1', p: 2,
          ph: '2 ảnh: 1 toàn cảnh trụ cảm biến, 1 cận cảnh vòm kính cảm biến bức xạ. ' + BEFORE,
          i: { cach: 'Chụp hiện trạng vòm kính và các cảm biến trước khi lau.', vi: 'Ảnh trước và sau là bằng chứng đã vệ sinh.', luu: 'Chưa chạm vào vòm kính ở bước này.' } },
        { n: 2, t: 'Cảm biến bức xạ và cảm biến nhiệt độ SAU khi vệ sinh', form: 'G1', p: 2,
          ph: '2 ảnh: 1 toàn cảnh, 1 cận cảnh vòm kính đã sạch. ' + AFTER,
          i: { cach: 'Lau vòm kính bằng khăn mềm và nước sạch. Lau cảm biến nhiệt độ, vỏ hộp đấu nối.', vi: 'Vòm kính bẩn làm số bức xạ thấp giả, kéo theo tính sai hiệu suất PR của cả nhà máy.', luu: 'Không dùng dung môi hay vật cứng làm xước vòm kính.' } },
        { n: 3, t: 'Lắp đặt cảm biến: cảm biến bức xạ cân bằng đúng góc, giá đỡ chắc; cảm biến nhiệt độ tấm pin dán chắc; hộp đấu nối kín, cáp tín hiệu nguyên vẹn', form: 'G2', p: 3,
          ph: '3 ảnh: 1 cận cảnh bọt thủy cân bằng của cảm biến bức xạ, 1 cảm biến nhiệt độ dán dưới tấm pin, 1 bên trong hộp đấu nối.',
          i: { cach: 'Xem bọt thủy trên đế cảm biến bức xạ. Lắc nhẹ giá đỡ. Kiểm tra cảm biến nhiệt độ còn dán sát mặt sau tấm pin. Mở hộp đấu nối xem ẩm và đầu dây.', vi: 'Cảm biến lệch góc hoặc bong keo cho số liệu sai mà hệ thống không báo lỗi.', luu: 'Không tự chỉnh lại góc nếu chưa ghi nhận hiện trạng bằng ảnh.' } }
      ]
    },
    {
      k: 'lps', pre: 'LPS', title: 'Chống sét trực tiếp', one: 'Kim thu sét', zone: 'Mái',
      tasks: [
        { n: 1, t: 'Kim thu sét, trụ đỡ, dây néo: chắc chắn, không rỉ, không nghiêng', p: 2,
          ph: '2 ảnh: 1 toàn cảnh kim và trụ, 1 cận cảnh chân trụ và dây néo.',
          i: { cach: 'Quan sát kim, trụ, các dây néo và tăng đơ. Kiểm tra chân trụ và keo chống thấm quanh chân.', vi: 'Trụ gãy đổ làm vỡ tấm pin và mất vùng bảo vệ chống sét.', luu: 'Không lại gần kim thu sét khi trời có giông.' } },
        { n: 2, t: 'Dây thoát sét và mối nối xuống hệ tiếp địa; ghi số trên bộ đếm sét (nếu có)', p: 1,
          ph: '1 ảnh: mối nối dây thoát sét hoặc mặt bộ đếm sét.',
          i: { cach: 'Đi theo dây thoát sét từ trụ xuống. Kiểm tra kẹp giữ, mối nối, ống bảo vệ. Ghi số bộ đếm sét vào ghi chú.', vi: 'Dây thoát sét đứt thì kim thu sét không còn tác dụng.', luu: 'Số đếm tăng so với quý trước thì kiểm tra kỹ SPD ở các tủ.' } }
      ]
    },
    {
      k: 'pump', pre: 'PMP', title: 'Hệ thống nước vệ sinh', one: 'Trạm bơm', zone: 'Trạm inverter',
      tasks: [
        { n: 1, t: 'Bồn nước, bơm, đường ống, van và vòi trên mái không rò rỉ; chạy thử bơm', p: 2,
          ph: '2 ảnh: 1 cụm bồn và bơm, 1 van hoặc vòi trên mái khi đang có nước.',
          i: { cach: 'Mở van, chạy thử bơm vài phút. Kiểm tra các khớp nối, van trên mái, phao bồn.', vi: 'Ống rò trên mái gây dột xưởng. Bơm hỏng thì không vệ sinh được tấm pin.', luu: 'Khóa van và ngắt bơm sau khi thử.' } },
        { n: 2, t: 'Tủ điện bơm: MCB, chống sét, đấu nối và vỏ tủ', p: 1,
          ph: '1 ảnh: bên trong tủ điện bơm.',
          i: { cach: 'Mở tủ, kiểm tra MCB, SPD, đầu dây, dấu hiệu ẩm.', vi: 'Tủ bơm đặt ngoài trời dễ vào nước gây chập.', luu: 'Ngắt MCB trước khi chạm vào đầu dây.' } }
      ]
    },
    {
      k: 'ist', pre: 'ST', title: 'Nhà trạm inverter', one: 'Nhà trạm inverter', zone: 'Trạm inverter',
      tasks: [
        { n: 1, t: 'Kết cấu trạm: khung thép, mái che, hàng rào lưới, bệ bê tông không rỉ, không dột, bulong chân cột chắc', p: 2,
          ph: '2 ảnh: 1 toàn cảnh trạm từ bên ngoài, 1 cận cảnh chân cột và bệ.',
          i: { cach: 'Đi một vòng quanh trạm. Kiểm tra mái che, máng nước, chân cột, lưới rào.', vi: 'Mái che dột làm nước chảy vào inverter và tủ điện.', luu: 'Ghi vị trí dột theo số inverter gần nhất.' } },
        { n: 2, t: 'Cửa, khóa, biển cảnh báo điện và sơ đồ một sợi tại trạm', p: 2,
          ph: '2 ảnh: 1 cửa trạm có khóa và biển cảnh báo, 1 sơ đồ một sợi dán tại trạm.',
          i: { cach: 'Kiểm tra khóa, bản lề, biển cảnh báo còn đọc được, sơ đồ một sợi còn đủ.', vi: 'Trạm không khóa thì người không phận sự tiếp cận được thiết bị đang mang điện.', luu: 'Khóa lại khi rời trạm.' } },
        { n: 3, t: 'Nền và khu vực trong trạm TRƯỚC khi vệ sinh', p: 1,
          ph: '1 ảnh: toàn cảnh nền trạm. ' + BEFORE,
          i: { cach: 'Chụp hiện trạng nền, góc trạm, gầm inverter trước khi dọn.', vi: 'Ảnh trước và sau là bằng chứng đã vệ sinh.', luu: 'Ghi chú nếu thấy tổ ong, tổ kiến, dấu vết chuột.' } },
        { n: 4, t: 'Nền và khu vực trong trạm SAU khi vệ sinh: sạch rác, cỏ, tổ côn trùng, không có vật dễ cháy', p: 1,
          ph: '1 ảnh: toàn cảnh nền trạm. ' + AFTER,
          i: { cach: 'Quét dọn nền, dọn cỏ quanh bệ, gỡ tổ côn trùng, mang rác và vật liệu thừa ra khỏi trạm.', vi: 'Rác và vật dễ cháy trong trạm làm đám cháy lan nhanh. Côn trùng và chuột phá cáp.', luu: 'Không để lại giẻ lau, chai lọ, thùng giấy trong trạm.' } }
      ]
    },
    {
      k: 'inv', pre: 'INV', title: 'Inverter', one: 'Inverter', zone: 'Trạm inverter',
      tasks: [
        { n: 1, g: 'Nhận dạng', t: 'Nhãn tên, số serial, biển cảnh báo an toàn điện đầy đủ, rõ', form: 'C1', p: 2,
          ph: '2 ảnh: 1 toàn cảnh mặt trước inverter thấy nhãn số thứ tự, 1 cận cảnh nhãn thông số có serial đọc được.',
          i: { cach: 'Đối chiếu số thứ tự inverter với bản vẽ. Kiểm tra nhãn thông số, tem cảnh báo, nhãn các string.', vi: 'Nhầm inverter khi thao tác hoặc khi báo bảo hành gây mất thời gian và mất an toàn.', luu: 'Nhãn mờ hoặc bong thì ghi tồn tại để dán lại.' } },
        { n: 2, g: 'Vệ sinh vỏ', t: 'Vỏ và ngoại quan inverter TRƯỚC khi vệ sinh', form: 'C2', p: 2,
          ph: '2 ảnh: 1 chính diện, 1 mặt bên hoặc mặt trên có nhiều bụi. ' + BEFORE,
          i: { cach: 'Quan sát và chụp vỏ máy: bụi, vết nước, rỉ, móp, tổ côn trùng. Chưa lau ở bước này.', vi: 'Ảnh hiện trạng cho thấy mức bám bẩn theo từng quý và là bằng chứng đối chiếu với ảnh sau vệ sinh.', luu: 'Thấy vết nước chảy, vết cháy xém hoặc móp thì chụp cận cảnh thêm.' } },
        { n: 3, g: 'Vệ sinh vỏ', t: 'Vỏ và ngoại quan inverter SAU khi vệ sinh: sạch, không rỉ, không móp, gioăng kín', form: 'C2', p: 2,
          ph: '2 ảnh: 1 chính diện, 1 mặt bên. ' + AFTER,
          i: { cach: 'Lau vỏ bằng khăn khô hoặc ẩm vắt kiệt. Kiểm tra gioăng nắp khoang đấu nối và các ốc nắp.', vi: 'Lớp bụi dày giữ nhiệt và giữ ẩm, làm vỏ rỉ và máy giảm công suất do nóng.', luu: 'Không xịt nước trực tiếp vào inverter.' } },
        { n: 4, g: 'Vệ sinh quạt', t: 'Quạt và khe tản nhiệt TRƯỚC khi vệ sinh', form: 'C2', p: 2,
          ph: '2 ảnh: 1 cận cảnh quạt hoặc lưới hút gió, 1 cận cảnh khe tản nhiệt. ' + BEFORE,
          i: { cach: 'Chụp hiện trạng quạt, lưới hút gió và các lá tản nhiệt trước khi thổi bụi.', vi: 'Ảnh hiện trạng cho thấy mức tắc bụi của đường gió.', luu: 'Nghe tiếng quạt khi máy đang chạy. Tiếng kêu lạ thì ghi vào ghi chú.' } },
        { n: 5, g: 'Vệ sinh quạt', t: 'Quạt và khe tản nhiệt SAU khi vệ sinh: thông thoáng, quạt quay êm', form: 'C2', p: 2,
          ph: '2 ảnh: 1 cận cảnh quạt đã sạch, 1 cận cảnh khe tản nhiệt đã sạch. ' + AFTER,
          i: { cach: 'Thổi bụi bằng khí nén hoặc chổi mềm từ trong ra ngoài. Tháo khay quạt vệ sinh nếu hãng cho phép. Lắp lại, xác nhận quạt quay khi máy tải cao.', vi: 'Quạt và tản nhiệt tắc bụi làm inverter quá nhiệt, tự giảm công suất và giảm tuổi thọ linh kiện.', luu: 'Theo hướng dẫn của hãng về việc tắt máy trước khi tháo quạt. Quạt hỏng thì ghi tồn tại để thay.' } },
        { n: 6, g: 'Lắp đặt', t: 'Giá treo và bulong chắc chắn; khoảng thoáng tản nhiệt quanh máy không bị che', p: 1,
          ph: '1 ảnh: inverter và khoảng trống xung quanh, thấy giá treo.',
          i: { cach: 'Lắc nhẹ thân máy, nhìn bulong giá treo. Kiểm tra không có vật che khe gió.', vi: 'Máy hơn 80 kg treo trên khung. Bulong lỏng là nguy cơ rơi máy.', luu: 'Không để vật dụng trên nóc hoặc dưới gầm inverter.' } },
        { n: 7, g: 'Phía DC', t: 'Đầu nối MC4 tại inverter cắm chặt, không biến màu, không chảy; DC switch nguyên vẹn', p: 2,
          ph: '2 ảnh: 1 toàn bộ cụm đầu nối DC dưới đáy máy, 1 cận cảnh DC switch.',
          i: { cach: 'Nhìn và lắc nhẹ từng đầu MC4. Kiểm tra vỏ nhựa, màu sắc, cáp không bị kéo căng hay gập gãy.', vi: 'MC4 tiếp xúc kém sinh nhiệt, chảy nhựa, gây hồ quang và cháy.', luu: 'Không rút MC4 khi đang có dòng. Muốn rút phải tắt DC switch trước.' } },
        { n: 8, g: 'Phía DC', t: 'Đo kẹp dòng toàn bộ string của inverter', u: 'A', multi: 'str', p: 2,
          ph: '2 ảnh: 1 ampe kìm đang kẹp một string thấy rõ số đo, 1 toàn cảnh cụm cáp DC đã đo.',
          i: { lam: 'Kẹp dòng từng string, không bỏ sót string nào, và ghi số đo vào đúng ô của string đó.', cach: 'Dùng ampe kìm DC, chỉnh 0 trước khi đo. Kẹp một dây (dương hoặc âm) của từng string theo thứ tự ngõ vào PV1, PV2… Đo liên tục trong vài phút khi trời nắng ổn định để các string so sánh được với nhau.', vi: 'String có dòng thấp hơn hẳn các string cùng hướng là dấu hiệu tấm hỏng, MC4 lỏng, diode chết hoặc bị che. String dòng bằng 0 là hở mạch hoặc cháy cầu chì.', luu: 'Ô nhập tự tô màu string lệch quá 10 % so với trung vị. Mây che lúc đang đo thì đo lại cả inverter. Không kẹp chung hai dây ngược chiều.' } },
        { n: 9, g: 'Quét nhiệt', t: 'Quét nhiệt đầu cáp DC (cụm đầu nối MC4); ghi nhiệt độ cao nhất', u: '°C', p: 2,
          ph: '2 ảnh: 1 ảnh nhiệt toàn cụm đầu nối DC có thang nhiệt độ, 1 ảnh thường cùng góc.',
          i: { cach: 'Quét khi inverter đang phát từ 50 % công suất trở lên. Chỉnh thang nhiệt để thấy rõ điểm nóng nhất. Ghi nhiệt độ cao nhất vào ô giá trị.', vi: 'Đầu nối nóng hơn các đầu bên cạnh là tiếp xúc kém, sẽ cháy nếu để lâu.', luu: 'Đầu nối nóng hơn các đầu cùng cụm trên 10 °C thì chấm Không đạt và ghi string tương ứng.' } },
        { n: 10, g: 'Quét nhiệt', t: 'Quét nhiệt đầu cáp AC và cáp tiếp địa; ghi nhiệt độ cao nhất', u: '°C', p: 2,
          ph: '2 ảnh: 1 ảnh nhiệt khoang đấu nối AC và đoạn cáp AC ra khỏi máy có thang nhiệt độ, 1 ảnh thường cùng góc.',
          i: { cach: 'Quét khi inverter đang phát từ 50 % công suất trở lên. Quét nắp khoang đấu nối AC, ốc siết cáp và đoạn cáp AC ngay dưới máy. So sánh ba pha với nhau.', vi: 'Đầu cốt AC lỏng mang dòng hơn 150 A sẽ nóng chảy và cháy khoang đấu nối.', luu: 'Không mở nắp khoang đấu nối khi máy đang mang điện. Một pha nóng hơn hai pha còn lại trên 10 °C thì chấm Không đạt.' } },
        { n: 11, g: 'Cần cắt điện', t: 'Siết lại đầu cáp AC và tiếp địa vỏ theo lực siết của hãng', f: 'Y', off: 1, p: 2,
          ph: '2 ảnh: 1 khoang đấu nối AC đã mở, 1 cờ lê lực đang siết đầu cốt.',
          i: { cach: 'Cắt MCCB của inverter tại tủ AC, tắt DC switch, chờ theo thời gian xả tụ của hãng, kiểm tra không còn điện rồi mới mở nắp. Siết đúng lực, đánh dấu sơn.', vi: 'Đầu cốt giãn nở theo chu kỳ nhiệt nên lỏng dần theo năm tháng.', luu: 'Khóa và treo biển tại MCCB trong suốt thời gian thao tác.' } },
        { n: 12, g: 'Cần cắt điện', t: 'Đo điện trở cách điện các string (ghi giá trị thấp nhất)', f: 'Y', off: 1, u: 'MΩ', p: 1,
          ph: '1 ảnh: màn hình megaohm với giá trị thấp nhất.',
          i: { cach: 'Tắt inverter, cô lập từng string, đo cách điện cực dương và cực âm so với đất ở 1000 V. Có thể dùng chức năng đo cách điện của inverter nếu hãng hỗ trợ.', vi: 'Cách điện giảm báo trước sự cố chạm đất, gây dừng máy khi trời ẩm.', luu: 'Tối thiểu 1 MΩ theo IEC 62446-1. Ghi string có giá trị thấp nhất vào ghi chú.' } }
      ]
    },
    {
      k: 'db', pre: 'DB', title: 'Tủ điện AC', one: 'Tủ điện', zone: 'Trạm inverter',
      opts: { fan: 'Tủ có quạt thông gió', meter: 'Có công tơ sản lượng', apfc: 'Có tụ bù (APFC)' },
      tasks: [
        { n: 1, g: 'Vỏ tủ', t: 'Vỏ tủ không trầy xước, móp, rỉ; gioăng cửa, khóa và bệ tủ tốt; lỗ cáp vào đã bịt kín', form: 'D1', p: 2,
          ph: '2 ảnh: 1 toàn cảnh tủ khi đóng cửa, 1 cận cảnh đáy tủ và lỗ cáp vào.',
          i: { cach: 'Đi quanh tủ. Kiểm tra sơn, gioăng, bản lề, khóa, chân đế và vị trí cáp vào tủ.', vi: 'Tủ hở là đường vào của nước, chuột, rắn và côn trùng, gây ngắn mạch thanh cái.', luu: 'Lỗ cáp chưa bịt thì ghi tồn tại mức B.' } },
        { n: 2, g: 'Vệ sinh tủ', t: 'Bên trong tủ TRƯỚC khi vệ sinh', form: 'D1', p: 2,
          ph: '2 ảnh: 1 toàn cảnh trong tủ khi mở cửa, 1 đáy tủ. ' + BEFORE,
          i: { cach: 'Mở cửa, chụp hiện trạng: bụi, mạng nhện, xác côn trùng, vết nước, vật lạ.', vi: 'Ảnh trước và sau là bằng chứng đã vệ sinh.', luu: 'Đứng ngoài khoảng cách an toàn, không đưa tay hay điện thoại vào gần thanh cái.' } },
        { n: 3, g: 'Vệ sinh tủ', t: 'Bên trong tủ SAU khi vệ sinh: sạch bụi, không đọng nước, không côn trùng, không có vật lạ', form: 'D1', p: 2,
          ph: '2 ảnh: 1 toàn cảnh trong tủ, 1 đáy tủ. ' + AFTER,
          i: { cach: 'Hút bụi phần đáy tủ, khoang cáp và mặt cửa bằng máy hút có đầu cách điện. Phần gần thanh cái chỉ vệ sinh khi đã cắt điện.', vi: 'Bụi ẩm bám trên thanh cái và sứ đỡ gây phóng điện bề mặt.', luu: 'Không dùng khăn ướt, không thổi khí nén làm bụi bay vào thiết bị đóng cắt.' } },
        { n: 4, g: 'Vệ sinh tủ', t: 'Quạt và lưới lọc của tủ TRƯỚC khi vệ sinh', opt: 'fan', p: 1,
          ph: '1 ảnh: cận cảnh quạt và lưới lọc. ' + BEFORE,
          i: { cach: 'Chụp hiện trạng quạt và tấm lọc bụi.', vi: 'Ảnh hiện trạng cho thấy mức tắc bụi.', luu: 'Tiếng quạt kêu lạ thì ghi vào ghi chú.' } },
        { n: 5, g: 'Vệ sinh tủ', t: 'Quạt và lưới lọc của tủ SAU khi vệ sinh; quạt chạy khi chỉnh rơ le nhiệt', opt: 'fan', p: 1,
          ph: '1 ảnh: cận cảnh quạt và lưới lọc đã sạch. ' + AFTER,
          i: { cach: 'Tháo tấm lọc, giũ hoặc thổi sạch, lắp lại. Vặn rơ le nhiệt xuống thấp để thử quạt chạy rồi trả về mức cũ.', vi: 'Tủ ngoài trời nóng làm ACB, MCCB tác động sai và giảm tuổi thọ.', luu: 'Nhớ trả rơ le nhiệt về đúng mức cài đặt ban đầu.' } },
        { n: 6, g: 'Thiết bị', t: 'ACB, MCCB, MCB: đúng trạng thái, không biến màu, không mùi khét; nhãn lộ ra đầy đủ', form: 'D1', p: 2,
          ph: '2 ảnh: 1 toàn bộ dãy MCCB thấy nhãn lộ ra, 1 cận cảnh ACB tổng.',
          i: { cach: 'Quan sát từng thiết bị đóng cắt: vị trí cần gạt, màu vỏ nhựa, đầu cốt, nhãn. Ngửi mùi khét khi vừa mở cửa.', vi: 'Vỏ biến màu hoặc có mùi khét là dấu hiệu tiếp xúc kém đang phát nhiệt.', luu: 'Không đóng cắt thử khi chưa thống nhất với nhà máy.' } },
        { n: 7, g: 'Thiết bị', t: 'Chống sét lan truyền (SPD): cửa sổ chỉ thị còn tốt, MCCB hoặc cầu chì bảo vệ SPD đang đóng', p: 1,
          ph: '1 ảnh: cận cảnh SPD thấy rõ cửa sổ chỉ thị.',
          i: { cach: 'Xem cửa sổ chỉ thị trên từng module SPD. Xanh là tốt, đỏ là đã hỏng.', vi: 'SPD đã hỏng thì cú sét tiếp theo đi thẳng vào inverter và thiết bị giám sát.', luu: 'Module báo đỏ thì ghi tồn tại mức B và đề xuất thay.' } },
        { n: 8, g: 'Thiết bị', t: 'Đồng hồ, đèn báo pha, cầu chì mạch đo; nút dừng khẩn cấp nguyên vẹn', p: 1,
          ph: '1 ảnh: mặt cửa tủ thấy đèn báo pha, đồng hồ và nút dừng khẩn cấp.',
          i: { cach: 'Kiểm tra ba đèn pha sáng đủ, đồng hồ hiển thị, nắp bảo vệ nút dừng khẩn cấp còn nguyên.', vi: 'Đèn pha tắt có thể do cháy cầu chì hoặc mất pha thật.', luu: 'Không bấm thử nút dừng khẩn cấp trong đợt quý.' } },
        { n: 9, g: 'Thiết bị', t: 'Công tơ sản lượng: ghi chỉ số tổng', opt: 'meter', u: 'kWh', p: 1,
          ph: '1 ảnh: mặt công tơ thấy rõ chỉ số.',
          i: { cach: 'Đọc chỉ số điện năng giao tổng trên công tơ và ghi vào ô giá trị.', vi: 'Chỉ số công tơ là căn cứ tính sản lượng và đối chiếu với hệ thống giám sát.', luu: 'Ghi kèm giờ đọc vào ghi chú.' } },
        { n: 10, g: 'Thiết bị', t: 'Tụ bù và contactor: tụ không phồng, không rò dầu; ghi cosφ trên bộ điều khiển', opt: 'apfc', u: 'cosφ', p: 1,
          ph: '1 ảnh: dãy tụ bù và mặt bộ điều khiển.',
          i: { cach: 'Quan sát vỏ tụ, đầu cực, contactor. Đọc cosφ trên bộ điều khiển.', vi: 'Tụ phồng có thể nổ. Cosφ thấp làm khách hàng bị phạt công suất phản kháng.', luu: 'Không chạm vào tụ khi chưa xả.' } },
        { n: 11, g: 'Quét nhiệt', t: 'Quét nhiệt thanh cái, đầu cáp, ACB và các MCCB khi mang tải; ghi nhiệt độ cao nhất', u: '°C', p: 3,
          ph: '3 ảnh: 1 ảnh nhiệt dãy MCCB, 1 ảnh nhiệt ACB tổng và đầu cáp ra, 1 ảnh thường cùng góc điểm nóng nhất.',
          i: { cach: 'Quét khi hệ thống đang phát từ 50 % công suất trở lên. Mở cửa ngoài, quét từng MCCB, đầu cáp vào và ra, thanh cái. So sánh ba pha của cùng một thiết bị.', vi: 'Điểm nóng tại đầu cốt hoặc tiếp điểm là dấu hiệu sớm nhất của sự cố cháy tủ.', luu: 'Một pha nóng hơn hai pha còn lại trên 10 °C thì chấm Không đạt và ghi rõ lộ nào, pha nào. Giữ khoảng cách an toàn, không tháo tấm che khi tủ đang mang điện.' } },
        { n: 12, g: 'Quét nhiệt', t: 'Đo dòng từng cấp tụ bù so với định mức', opt: 'apfc', f: 'H', u: 'A', p: 1,
          ph: '1 ảnh: ampe kìm đang kẹp một cấp tụ.',
          i: { cach: 'Đóng tay từng cấp tụ và kẹp dòng ba pha.', vi: 'Dòng thấp hơn định mức là tụ đã suy giảm dung lượng.', luu: 'Ghi cấp tụ có dòng thấp vào ghi chú.' } },
        { n: 13, g: 'Cần cắt điện', t: 'Siết lại đầu cáp và thanh cái theo lực siết', f: 'Y', off: 1, p: 2,
          ph: '2 ảnh: 1 cờ lê lực đang siết, 1 dấu sơn đánh dấu sau khi siết.',
          i: { cach: 'Cắt điện toàn tủ, khóa và treo biển, thử không còn điện, nối đất tạm. Siết từng đầu cốt và mối nối thanh cái theo lực quy định, đánh dấu sơn.', vi: 'Mối nối lỏng là nguyên nhân hàng đầu gây cháy tủ điện.', luu: 'Chỉ làm khi đã có giấy phép cắt điện của nhà máy.' } },
        { n: 14, g: 'Cần cắt điện', t: 'Thử nút dừng khẩn cấp và cuộn cắt của ACB', f: 'Y', off: 1, p: 1,
          ph: '1 ảnh: ACB ở trạng thái đã cắt sau khi bấm nút.',
          i: { cach: 'Thống nhất thời điểm với nhà máy. Bấm nút dừng khẩn cấp, xác nhận ACB cắt, sau đó đóng lại theo quy trình.', vi: 'Nút dừng khẩn cấp phải hoạt động khi có cháy.', luu: 'Toàn bộ hệ thống mất điện khi thử.' } }
      ]
    },
    {
      k: 'mon', pre: 'MON', title: 'Giám sát & truyền thông', one: 'Tủ giám sát', zone: 'Trạm inverter',
      opts: { ups: 'Có UPS' },
      tasks: [
        { n: 1, t: 'Tủ giám sát TRƯỚC khi vệ sinh', form: 'F1', p: 2,
          ph: '2 ảnh: 1 toàn cảnh trong tủ khi mở cửa, 1 đáy tủ. ' + BEFORE,
          i: { cach: 'Mở cửa, chụp hiện trạng bụi, ẩm, côn trùng.', vi: 'Ảnh trước và sau là bằng chứng đã vệ sinh.', luu: 'Chưa rút dây nào ở bước này.' } },
        { n: 2, t: 'Tủ giám sát SAU khi vệ sinh: sạch, thông thoáng, không đọng nước, không côn trùng', form: 'F1', p: 2,
          ph: '2 ảnh: 1 toàn cảnh trong tủ, 1 đáy tủ. ' + AFTER,
          i: { cach: 'Dùng chổi mềm và máy hút nhỏ làm sạch đáy tủ, khe gió. Kiểm tra gioăng cửa và lỗ cáp.', vi: 'Thiết bị điện tử trong tủ hỏng nhanh do ẩm và kiến làm tổ.', luu: 'Không làm lỏng các đầu dây tín hiệu khi vệ sinh.' } },
        { n: 3, t: 'Thiết bị trong tủ: đèn nguồn và đèn trạng thái của bộ thu thập dữ liệu, router, switch, bộ nguồn sáng bình thường; đầu dây RS485 và nguồn chắc', form: 'F2', p: 2,
          ph: '2 ảnh: 1 cận cảnh đèn trạng thái các thiết bị, 1 cận cảnh cầu đấu RS485.',
          i: { cach: 'Quan sát đèn nguồn, đèn mạng của từng thiết bị. Lắc nhẹ các đầu dây RS485, nguồn 24 V, cáp mạng.', vi: 'Mất giám sát thì không phát hiện được sự cố inverter và mất dữ liệu sản lượng.', luu: 'Thiết bị tắt đèn thì ghi rõ tên thiết bị vào ghi chú.' } },
        { n: 4, t: 'UPS: đèn trạng thái bình thường, không báo lỗi ắc quy; thử ngắt nguồn vào 1 phút', opt: 'ups', p: 1,
          ph: '1 ảnh: mặt UPS khi đang chạy bằng ắc quy.',
          i: { cach: 'Ngắt nguồn vào UPS trong 1 phút, xác nhận thiết bị giám sát vẫn chạy, sau đó cấp nguồn lại.', vi: 'UPS chết ắc quy thì mất giám sát mỗi lần chớp điện.', luu: 'UPS không giữ được 1 phút thì ghi tồn tại để thay ắc quy.' } },
        { n: 5, t: 'SIM 4G và anten: anten gắn chắc, ghi ngày hết hạn SIM', p: 1,
          ph: '1 ảnh: router thấy khe SIM và anten.',
          i: { cach: 'Kiểm tra anten, cáp anten. Ghi ngày hết hạn gói cước vào ghi chú nếu có thông tin.', vi: 'SIM hết hạn là nguyên nhân mất kết nối hay gặp nhất.', luu: 'Không rút SIM khi router đang chạy.' } }
      ]
    },
    {
      k: 'cctv', pre: 'CAM', title: 'Camera giám sát', one: 'Camera', zone: 'Trạm inverter',
      tasks: [
        { n: 1, t: 'Camera TRƯỚC khi vệ sinh ống kính', p: 1,
          ph: '1 ảnh: cận cảnh camera. ' + BEFORE,
          i: { cach: 'Chụp hiện trạng ống kính, vỏ, mạng nhện quanh camera.', vi: 'Ảnh trước và sau là bằng chứng đã vệ sinh.', luu: 'Dùng thang đúng quy định khi camera lắp cao.' } },
        { n: 2, t: 'Camera SAU khi vệ sinh: ống kính sạch, gá chắc, đúng góc nhìn, cáp mạng nguyên vẹn', p: 1,
          ph: '1 ảnh: cận cảnh camera đã sạch. ' + AFTER,
          i: { cach: 'Lau ống kính bằng khăn mềm, gỡ mạng nhện, siết lại gá nếu lỏng.', vi: 'Camera mờ hoặc lệch góc thì không còn giá trị khi cần xem lại sự cố.', luu: 'Không xoay lệch góc nhìn so với ban đầu.' } },
        { n: 3, t: 'Switch PoE, router và thẻ nhớ camera: đèn hoạt động bình thường', p: 1,
          ph: '1 ảnh: switch PoE thấy đèn các cổng.',
          i: { cach: 'Quan sát đèn nguồn và đèn cổng của switch PoE.', vi: 'Cổng PoE tắt thì camera mất nguồn.', luu: 'Ghi camera nào mất tín hiệu vào ghi chú.' } }
      ]
    },
    {
      k: 'ff', pre: 'FF', title: 'Phòng cháy chữa cháy', one: 'PCCC', zone: 'Trạm inverter',
      opts: { auto: 'Có bình chữa cháy tự động', smoke: 'Có đầu báo cháy' },
      tasks: [
        { n: 1, t: 'Bình chữa cháy xách tay: đủ số lượng, có kẹp chì, vòi, chốt, tay cầm; còn hạn, kim áp suất ở vùng xanh', form: 'H1', p: 2,
          ph: '2 ảnh: 1 toàn bộ các bình tại vị trí đặt, 1 cận cảnh đồng hồ áp suất và tem kiểm định.',
          i: { cach: 'Đếm số bình so với bản vẽ. Kiểm tra từng bình: kim áp suất, chốt, kẹp chì, vòi, tem kiểm định còn hạn.', vi: 'Bình hết áp hoặc hết hạn không dập được đám cháy lúc mới phát sinh.', luu: 'Ghi số bình và ngày hết hạn gần nhất vào ghi chú.' } },
        { n: 2, t: 'Bình chữa cháy tự động: treo chắc đúng vị trí, kim áp suất ở vùng xanh, đầu phun không bị che', form: 'H1', opt: 'auto', p: 2,
          ph: '2 ảnh: 1 toàn cảnh các bình treo trên trần trạm, 1 cận cảnh đồng hồ áp suất một bình.',
          i: { cach: 'Đếm số bình so với bản vẽ. Kiểm tra giá treo, kim áp suất, đầu cảm biến nhiệt.', vi: 'Bình tự động là lớp bảo vệ khi không có người tại trạm.', luu: 'Không va chạm vào đầu cảm biến nhiệt bằng thủy tinh.' } },
        { n: 3, t: 'Đầu báo cháy TRƯỚC khi vệ sinh', form: 'H2', opt: 'smoke', p: 1,
          ph: '1 ảnh: cận cảnh đầu báo. ' + BEFORE,
          i: { cach: 'Chụp hiện trạng đầu báo.', vi: 'Ảnh trước và sau là bằng chứng đã vệ sinh.', luu: 'Báo cho phòng trực PCCC của nhà máy trước khi thao tác.' } },
        { n: 4, t: 'Đầu báo cháy SAU khi vệ sinh: sạch bụi, đèn trạng thái nháy bình thường', form: 'H2', opt: 'smoke', p: 1,
          ph: '1 ảnh: cận cảnh đầu báo đã sạch. ' + AFTER,
          i: { cach: 'Thổi bụi hoặc lau nhẹ bên ngoài đầu báo.', vi: 'Đầu báo bám bụi báo giả hoặc không báo.', luu: 'Không tháo đầu báo nếu chưa cô lập kênh báo cháy.' } },
        { n: 5, t: 'Biển cảnh báo, nội quy và hướng dẫn ngắt khẩn cấp đầy đủ, đọc được', p: 1,
          ph: '1 ảnh: bảng nội quy và hướng dẫn ngắt khẩn cấp.',
          i: { cach: 'Kiểm tra các biển còn đủ, không phai màu, đặt nơi dễ thấy.', vi: 'Lực lượng chữa cháy cần biết ngay vị trí và cách ngắt điện mặt trời.', luu: 'Biển mờ thì ghi tồn tại để thay.' } }
      ]
    },
    {
      k: 'gnd', pre: 'GND', title: 'Tiếp địa', one: 'Hộp tiếp địa', zone: 'Trạm inverter',
      tasks: [
        { n: 1, t: 'Hộp kiểm tra tiếp địa, thanh cái tiếp địa, mối nối: không rỉ, không lỏng', p: 2,
          ph: '2 ảnh: 1 bên trong hộp kiểm tra tiếp địa, 1 cận cảnh mối nối cáp tiếp địa.',
          i: { cach: 'Mở hộp, kiểm tra thanh đồng, các đầu cốt, bulong. Lắc nhẹ từng dây.', vi: 'Mối nối rỉ làm điện trở tiếp địa tăng, mất tác dụng bảo vệ khi chạm vỏ và khi sét đánh.', luu: 'Đậy kín hộp sau khi kiểm tra.' } },
        { n: 2, t: 'Đo điện trở tiếp địa', f: 'Y', u: 'Ω', p: 2,
          ph: '2 ảnh: 1 màn hình máy đo với kết quả, 1 toàn cảnh cách bố trí cọc đo.',
          i: { cach: 'Đo bằng phương pháp ba cực tại hộp kiểm tra tiếp địa vào ngày khô ráo.', vi: 'Điện trở vượt ngưỡng thì dòng sự cố không thoát được xuống đất.', luu: 'Không vượt 4 Ω hoặc theo thiết kế. Không đo khi trời mưa giông.' } }
      ]
    },
    {
      k: 'cable', pre: 'CA', title: 'Tuyến cáp AC', one: 'Tuyến cáp', zone: 'Trạm inverter',
      opts: { ug: 'Có đoạn cáp ngầm' },
      tasks: [
        { n: 1, t: 'Máng cáp và cáp AC: nắp máng đủ, không rỉ, vỏ cáp không nứt, không bị chuột cắn', form: 'E1', p: 2,
          ph: '2 ảnh: 1 dọc tuyến máng cáp, 1 cận cảnh cáp tại vị trí vào tủ.',
          i: { cach: 'Đi dọc tuyến máng. Kiểm tra nắp, giá đỡ, vỏ cáp tại các điểm uốn và điểm vào tủ.', vi: 'Cáp AC mang dòng lớn. Vỏ hỏng gây chạm đất và cháy.', luu: 'Vị trí xuyên tường phải được bịt kín.' } },
        { n: 2, t: 'Tuyến cáp ngầm: hố cáp và đầu ống bịt kín, mặt đất không sụt lún, còn biển báo cáp ngầm', form: 'E1', opt: 'ug', p: 2,
          ph: '2 ảnh: 1 dọc tuyến cáp ngầm trên mặt đất, 1 cận cảnh đầu ống tại hố cáp hoặc chân tủ.',
          i: { cach: 'Đi dọc tuyến trên mặt đất, xem sụt lún, dấu vết đào bới. Kiểm tra hố cáp và đầu ống tại hai đầu tuyến.', vi: 'Ống hở là đường nước và chuột vào tủ. Sụt lún báo hiệu ống có thể bị vỡ.', luu: 'Có công trình mới thi công gần tuyến cáp thì báo ngay cho chủ đầu tư.' } },
        { n: 3, t: 'Nhãn cáp hai đầu đầy đủ, đọc được', f: 'H', p: 2,
          ph: '2 ảnh: nhãn cáp ở mỗi đầu tuyến.',
          i: { cach: 'Đối chiếu nhãn cáp ở hai đầu với sơ đồ một sợi.', vi: 'Thiếu nhãn dễ thao tác nhầm lộ khi sửa chữa.', luu: 'Nhãn mờ thì ghi tồn tại để dán lại.' } }
      ]
    },
    {
      k: 'msb', pre: 'MSB', title: 'Điểm đấu nối', one: 'Điểm đấu nối', zone: 'Điểm đấu nối',
      tasks: [
        { n: 1, t: 'Lộ điện mặt trời tại tủ đấu nối: thiết bị đóng cắt đúng trạng thái, có nhãn nguồn điện mặt trời, đầu cáp không biến màu', p: 2,
          ph: '2 ảnh: 1 thiết bị đóng cắt lộ điện mặt trời thấy nhãn, 1 cận cảnh đầu cáp.',
          i: { cach: 'Cùng người của nhà máy mở tủ. Quan sát thiết bị đóng cắt, đầu cốt, nhãn cảnh báo hai nguồn.', vi: 'Đây là điểm ranh giới với lưới của nhà máy. Sự cố tại đây ảnh hưởng cả sản xuất của khách hàng.', luu: 'Tủ của nhà máy: chỉ quan sát, không thao tác.' } },
        { n: 2, t: 'Quét nhiệt đầu cáp lộ điện mặt trời; ghi nhiệt độ cao nhất', u: '°C', p: 2,
          ph: '2 ảnh: 1 ảnh nhiệt đầu cáp có thang nhiệt độ, 1 ảnh thường cùng góc.',
          i: { cach: 'Quét khi hệ thống đang phát từ 50 % công suất trở lên. So sánh ba pha.', vi: 'Điểm nóng tại đầu cốt là dấu hiệu sớm của sự cố.', luu: 'Một pha nóng hơn hai pha còn lại trên 10 °C thì chấm Không đạt.' } },
        { n: 3, t: 'Biến dòng đo đếm tại điểm đấu nối: gá chắc, đầu dây nhị thứ chắc', f: 'H', p: 1,
          ph: '1 ảnh: cận cảnh biến dòng và đầu dây.',
          i: { cach: 'Quan sát biến dòng, nhãn tỷ số, đầu dây nhị thứ và cầu đấu.', vi: 'Biến dòng hở mạch nhị thứ sinh điện áp nguy hiểm và làm sai số đo.', luu: 'Không tháo dây nhị thứ khi đang có dòng.' } }
      ]
    },
    {
      k: 'zx', pre: 'ZX', title: 'Đồng hồ chống phát ngược', one: 'Đồng hồ chống phát ngược', zone: 'Điểm đấu nối',
      tasks: [
        { n: 1, t: 'Đồng hồ hiển thị bình thường, không báo lỗi; biến dòng, dây tín hiệu và dây RS485 đấu chắc; cầu chì mạch áp còn tốt', p: 2,
          ph: '2 ảnh: 1 mặt đồng hồ đang hiển thị, 1 cận cảnh biến dòng và cầu đấu.',
          i: { cach: 'Cùng người của nhà máy mở tủ. Xem màn hình đồng hồ, biến dòng trên thanh cái hoặc cáp, cầu đấu, cầu chì mạch áp.', vi: 'Đồng hồ mất tín hiệu thì hệ thống không giới hạn được công suất, có thể phát ngược lên lưới hoặc tự giảm công suất về 0.', luu: 'Tủ của nhà máy: chỉ quan sát, không thao tác.' } }
      ]
    },
    {
      k: 'tba', pre: 'TBA', title: 'Trạm biến áp', one: 'Trạm biến áp', zone: 'Điểm đấu nối',
      tasks: [
        { n: 1, t: 'Máy biến áp: không rò dầu, mức dầu đủ, không có tiếng ồn bất thường; ghi nhiệt độ', u: '°C', p: 2,
          ph: '2 ảnh: 1 toàn cảnh máy biến áp, 1 cận cảnh đồng hồ nhiệt độ và mức dầu.',
          i: { cach: 'Quan sát từ ngoài hàng rào: vết dầu, mức dầu, đồng hồ nhiệt độ, tiếng ồn.', vi: 'Máy biến áp sự cố thì toàn bộ nhà máy điện dừng.', luu: 'Không vào trong hàng rào trạm khi chưa có giấy phép.' } },
        { n: 2, t: 'Trạm sạch, có khóa, biển báo, thông gió tốt', p: 1,
          ph: '1 ảnh: cửa trạm thấy khóa và biển báo.',
          i: { cach: 'Kiểm tra cỏ rác quanh trạm, khóa, biển báo.', vi: 'Cỏ rác khô quanh trạm là nguồn cháy.', luu: 'Ghi tồn tại nếu thấy dấu vết động vật.' } }
      ]
    },
    {
      k: 'end', pre: 'END', title: 'Kết thúc & trả hiện trường', one: 'Kết thúc', zone: 'Kết thúc',
      tasks: [
        { n: 1, t: 'Thu dọn dụng cụ, rác, vật tư trên mái và trong trạm; đếm đủ dụng cụ', p: 2,
          ph: '2 ảnh: 1 mái sau khi thu dọn, 1 toàn bộ dụng cụ đã mang xuống.',
          i: { cach: 'Đi lại một vòng các khu vực đã làm. Đếm dụng cụ theo danh sách lúc đầu ca.', vi: 'Dụng cụ bỏ quên trên mái gây bóng che, rơi xuống xưởng hoặc gây chập trong tủ.', luu: 'Đếm cả đầu vít, dây rút đã cắt.' } },
        { n: 2, t: 'Khóa tủ, cửa trạm, cửa thang; toàn bộ inverter hòa lưới lại bình thường', p: 2,
          ph: '2 ảnh: 1 dãy inverter thấy đèn trạng thái đang hòa lưới, 1 cửa trạm đã khóa.',
          i: { cach: 'Đi kiểm tra từng inverter đèn xanh, DC switch bật, MCCB đóng. Khóa các tủ, cửa trạm, cửa thang.', vi: 'Quên bật một DC switch hoặc một MCCB làm mất sản lượng cho tới khi có người phát hiện.', luu: 'Đối chiếu đủ số inverter trong hồ sơ dự án.' } },
        { n: 3, t: 'Thông báo sơ bộ các tồn tại cho đại diện nhà máy hoặc chủ đầu tư', p: 1,
          ph: '1 ảnh: biên bản ghi nhận hoặc sổ ra vào đã ký.',
          i: { cach: 'Nêu các tồn tại mức A và B đã ghi trong tab Tồn tại. Xin chữ ký xác nhận đã làm việc.', vi: 'Tồn tại mức A cần chủ đầu tư biết ngay trong ngày.', luu: 'Ký trả giấy phép làm việc trước khi rời nhà máy.' } }
      ]
    }
  ];

  // Mẫu checklist quý đang ký với chủ đầu tư (BBNT kèm checklist O&M).
  const FORM = [
    { k: 'A', t: 'Thang leo, lối đi bộ và dây cứu sinh', lines: [{ k: 'A1', t: 'Kiểm tra thang leo, lối đi và dây cứu sinh: không hư hỏng, không có điểm yếu', m: 'Trực quan và dụng cụ' }] },
    { k: 'B', t: 'Tấm pin NLMT và khung giá đỡ', lines: [
      { k: 'B1', t: 'Kiểm tra và siết lại các vị trí kẹp tấm pin', m: 'Trực quan và thiết bị' },
      { k: 'B2', t: 'Kiểm tra các vị trí có nguy cơ bị bóng che', m: 'Trực quan' },
      { k: 'B3', t: 'Kiểm tra số lượng tấm pin vỡ; cô lập và đánh dấu trên bản vẽ hoàn công', m: 'Trực quan và thiết bị' }] },
    { k: 'C', t: 'Bộ biến tần (inverter)', lines: [
      { k: 'C1', t: 'Inverter có đầy đủ nhãn tên, số serial và cảnh báo an toàn điện', m: 'Trực quan' },
      { k: 'C2', t: 'Vệ sinh vỏ, quạt của inverter và thay thế khi cần', m: 'Thiết bị' },
      { k: 'C3', t: 'Kiểm tra báo cáo sự cố của các inverter bằng ứng dụng', m: 'Ứng dụng', remote: 1 }] },
    { k: 'D', t: 'Tủ điện', lines: [{ k: 'D1', t: 'Vỏ tủ không trầy xước, móp; trong tủ thông thoáng, không đọng nước, côn trùng', m: 'Trực quan' }] },
    { k: 'E', t: 'Cáp điện', lines: [{ k: 'E1', t: 'Kiểm tra nguy cơ hoặc cáp hỏng', m: 'Trực quan' }] },
    { k: 'F', t: 'Thiết bị giám sát', lines: [
      { k: 'F1', t: 'Vệ sinh tủ giám sát; tủ thông thoáng, không đọng nước, côn trùng', m: 'Trực quan' },
      { k: 'F2', t: 'Trạng thái hoạt động của thiết bị giám sát bình thường', m: 'Trực quan' }] },
    { k: 'G', t: 'Trạm thời tiết', lines: [
      { k: 'G1', t: 'Vệ sinh cảm biến thời tiết', m: 'Thiết bị' },
      { k: 'G2', t: 'Cảm biến bức xạ lắp đúng góc, không hư hỏng', m: 'Trực quan' }] },
    { k: 'H', t: 'Hệ thống PCCC', lines: [
      { k: 'H1', t: 'Bình chữa cháy đầy đủ, có kẹp chì, vòi, chốt, tay cầm; còn hạn', m: 'Trực quan' },
      { k: 'H2', t: 'Vệ sinh đầu báo cháy', m: 'Thiết bị' }] }
  ];

  const RANK = { Q: 0, H: 1, Y: 2 };
  const SCOPES = { q: 'Hạng mục quý', h: 'Quý + hạng mục 6 tháng', y: 'Quý + 6 tháng + hằng năm' };
  const FREQ = { H: '6 tháng', Y: 'Hằng năm' };
  const kindOf = (k) => KINDS.find((x) => x.k === k);

  // Phạm vi mặc định theo quý: Quý 2 thêm hạng mục 6 tháng, Quý 4 thêm cả hạng mục năm.
  const defaultScope = (period) => ({ Q2: 'h', Q4: 'y' }[period] || 'q');

  function nextId(site, kind) {
    const K = kindOf(kind); const one = ['pre', 'end'].includes(kind);
    if (one && !site.assets.some((a) => a.id === K.pre)) return K.pre;
    for (let i = 1; ; i++) { const id = K.pre + i; if (!site.assets.some((a) => a.id === id)) return id; }
  }

  // Danh sách string: "14" -> PV1…PV14; "PV1, PV2, PV13" hoặc mảng -> giữ nguyên nhãn.
  function parseStr(v) {
    if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean).slice(0, 60);
    const s = String(v == null ? '' : v).trim(); if (!s) return [];
    if (/^\d+$/.test(s)) return Array.from({ length: Math.min(60, +s) }, (_, i) => 'PV' + (i + 1));
    return s.split(/[,;\n]+/).map((x) => x.trim()).filter(Boolean).slice(0, 60);
  }

  // Tạo nhanh hồ sơ thiết bị theo số lượng từng loại.
  const QUICK = [['roof', 'Số khu mái'], ['ladder', 'Số thang leo'], ['inv', 'Số inverter'], ['db', 'Số tủ điện AC'], ['mon', 'Số tủ giám sát'],
    ['ws', 'Số trạm thời tiết'], ['ist', 'Số nhà trạm inverter'], ['gnd', 'Số hộp tiếp địa'], ['msb', 'Số điểm đấu nối'], ['zx', 'Số đồng hồ chống phát ngược'],
    ['cable', 'Số tuyến cáp AC'], ['ff', 'Số khu vực PCCC'], ['cctv', 'Số camera'], ['lps', 'Số kim thu sét'], ['pump', 'Số trạm bơm nước vệ sinh'], ['tba', 'Số trạm biến áp trong phạm vi']];
  function quick(counts) {
    const c = Object.assign({ roof: 1, ladder: 1, inv: 1, db: 1, mon: 1, ws: 0, ist: 0, gnd: 1, msb: 1, zx: 0, cable: 0, ff: 1, cctv: 0, lps: 0, pump: 0, tba: 0 }, counts || {});
    const site = { zones: [], assets: [], notes: [] };
    const add = (kind, n) => {
      const K = kindOf(kind);
      for (let i = 0; i < n; i++) {
        const id = nextId(site, kind);
        site.assets.push({ k: kind, id, n: n > 1 ? `${K.one} ${String(i + 1).padStart(2, '0')}` : K.one, z: K.zone, d: '' });
      }
    };
    add('pre', 1);
    KINDS.filter((K) => K.k !== 'pre' && K.k !== 'end').forEach((K) => add(K.k, Math.max(0, Math.min(200, parseInt(c[K.k], 10) || 0))));
    add('end', 1);
    return normalize(site);
  }

  // Chuẩn hóa hồ sơ: bỏ thiết bị sai loại / trùng mã, bổ sung khu vực còn thiếu.
  function normalize(site) {
    site = site || {};
    const seen = new Set();
    site.assets = (site.assets || []).filter((a) => a && kindOf(a.k) && a.id && !seen.has(a.id) && seen.add(a.id))
      .map((a) => ({ k: a.k, id: String(a.id), n: String(a.n || kindOf(a.k).one), z: String(a.z || kindOf(a.k).zone), d: String(a.d || ''), opt: Array.isArray(a.opt) ? a.opt : [], str: parseStr(a.str) }));
    const zones = (site.zones || []).map(String).filter((z, i, arr) => z && arr.indexOf(z) === i);
    site.assets.forEach((a) => { if (!zones.includes(a.z)) zones.push(a.z); });
    site.zones = zones.filter((z) => site.assets.some((a) => a.z === z));
    site.notes = (site.notes || []).map(String).filter(Boolean);
    site.rev = Date.now() + Math.random();
    return site;
  }

  // Nhân checklist: mỗi thiết bị thành một nhóm, xếp theo khu vực (lộ trình).
  function build(site, scope) {
    const lim = RANK[(scope || 'q').toUpperCase()] || 0;
    const out = [];
    (site.zones || []).forEach((z, zi) => {
      site.assets.filter((a) => a.z === z).forEach((a) => {
        const K = kindOf(a.k);
        const items = K.tasks.filter((t) => !t.x && RANK[t.f || 'Q'] <= lim && (!t.opt || (a.opt || []).includes(t.opt)))
          .map((t) => ({ c: `${a.id}-${String(t.n).padStart(2, '0')}`, t: t.t, i: t.i, ph: t.ph, u: t.u, g: t.g, f: t.f || 'Q', p: t.p || 0, off: t.off, form: t.form || '',
            ms: t.multi === 'str' && a.str && a.str.length ? a.str : null, mh: t.multi === 'str' && !(a.str && a.str.length) ? 1 : 0 }));
        out.push({ id: a.id, title: a.n, sub: a.d, kind: a.k, part: String(zi + 1), partTitle: z, items });
      });
    });
    return out;
  }

  const countTasks = () => KINDS.reduce((n, K) => n + K.tasks.filter((t) => !t.x).length, 0);

  window.PM = { version: '2026.11-PM2', kinds: KINDS, form: FORM, scopes: SCOPES, freq: FREQ, quickFields: QUICK, kindOf, defaultScope, nextId, parseStr, quick, normalize, build, countTasks };
})();
