/*
 * Bộ checklist kiểm tra hiện trạng & nhận bàn giao O&M dự án điện mặt trời.
 * Thứ tự nhóm theo form FM-HOGY-OM-002 "Checklist of construction quality assessment" (I–XIX),
 * cộng thêm các nhóm hồ sơ, tủ DC, đo đếm và vật tư dự phòng.
 *
 * Cách sửa / bổ sung hạng mục:
 *   c : mã hạng mục (duy nhất). KHÔNG đổi hay dùng lại mã cũ: kết quả đã lưu gắn với mã.
 *   t : nội dung kiểm tra
 *   h : tiêu chí / hướng dẫn (hiện khi bấm nút "i")
 *   u : đơn vị nếu hạng mục cần ghi giá trị đo (V, °C, dB, Ω, kWh, m³...)
 *   s : loại dự án áp dụng, cách nhau bởi dấu cách: "roof" (áp mái), "ground" (mặt đất),
 *       "float" (nổi). Bỏ trống = áp dụng cho mọi loại.
 *   x : 1 = đã bỏ khỏi checklist. Không hiện ở biên bản mới; biên bản cũ đã có kết quả
 *       cho hạng mục này vẫn hiện để không mất dữ liệu.
 *
 * Khi đổi nội dung, tăng VERSION trong sw.js để điện thoại tải bản mới.
 */
window.CHECKLIST = {
  version: '2026.11-GY',
  types: {
    roof: 'Áp mái (Rooftop)',
    ground: 'Mặt đất (Ground-mounted)',
    float: 'Nổi trên mặt nước (Floating)'
  },
  sections: [
    {
      id: 'HS', title: 'Hồ sơ pháp lý & tài liệu bàn giao',
      items: [
        { c: 'HS-01', t: 'Giấy chứng nhận đầu tư / chủ trương đầu tư, giấy phép xây dựng (nếu thuộc diện cấp phép)', h: 'Bản sao có xác nhận; đối chiếu tên chủ đầu tư, địa điểm, công suất.' },
        { c: 'HS-02', t: 'Thỏa thuận đấu nối và Hợp đồng mua bán điện (PPA) với EVN / bên mua điện', h: 'Ghi lại điểm đấu nối, giới hạn công suất phát, cơ chế giá, thời hạn hợp đồng.' },
        { c: 'HS-03', t: 'Biên bản nghiệm thu hoàn thành đưa vào sử dụng, xác nhận ngày vận hành thương mại (COD)', h: 'Ngày COD là mốc tính bảo hành.' },
        { c: 'HS-04', t: 'Giấy phép hoạt động điện lực (nếu thuộc diện phải cấp)', h: 'Kiểm tra thời hạn hiệu lực và phạm vi hoạt động.' },
        { c: 'HS-05', t: 'Bản vẽ hoàn công: sơ đồ một sợi (SLD), mặt bằng bố trí tấm pin, sơ đồ đấu string', h: 'Bản cứng + file CAD/PDF. Sơ đồ string phải khớp nhãn thực tế ngoài hiện trường.' },
        { c: 'HS-06', t: 'Bản vẽ hoàn công tuyến cáp DC/AC, hệ thống tiếp địa và chống sét', h: 'Có vị trí cọc tiếp địa, hố kiểm tra, tuyến cáp ngầm.' },
        { c: 'HS-07', t: 'Hồ sơ thiết kế kết cấu khung giá đỡ, móng; báo cáo thẩm tra khả năng chịu lực mái', h: 'Áp mái: bắt buộc có đánh giá kết cấu mái/kèo chịu tải tấm pin, gió bão.' },
        { c: 'HS-08', t: 'Datasheet, chứng nhận CO/CQ của tấm pin, inverter, MBA, tủ điện, cáp', h: 'Đối chiếu model, số lượng với hóa đơn và thực tế lắp đặt.' },
        { c: 'HS-09', t: 'Danh sách serial tấm pin (kèm flash test) và serial inverter', h: 'File Excel; cần cho yêu cầu bảo hành sau này.' },
        { c: 'HS-10', t: 'Biên bản chạy thử (commissioning) của EPC', h: 'Lưu làm số liệu gốc khi vận hành.' },
        { c: 'HS-11', t: 'Báo cáo đo đường cong I-V và chụp ảnh nhiệt (IR) tại thời điểm nghiệm thu', x: 1 },
        { c: 'HS-12', t: 'Biên bản thí nghiệm MBA, tủ trung thế/RMU, rơ le bảo vệ, cáp trung thế', h: 'Do đơn vị thí nghiệm có chức năng thực hiện; kiểm tra ngày thí nghiệm.' },
        { c: 'HS-13', t: 'Phiếu chỉnh định rơ le và bảng thông số cài đặt inverter (grid code) đã được phê duyệt' },
        { c: 'HS-14', t: 'Biên bản kiểm định công tơ, TU/TI và biên bản niêm phong hệ thống đo đếm', h: 'Ghi nhận số tem kiểm định, số chì niêm phong.' },
        { c: 'HS-15', t: 'Biên bản đo điện trở tiếp địa và kiểm tra hệ thống chống sét' },
        { c: 'HS-16', t: 'Hồ sơ PCCC: thẩm duyệt / nghiệm thu PCCC, phương án chữa cháy cơ sở' },
        { c: 'HS-17', t: 'Tài liệu hướng dẫn vận hành & bảo trì (O&M manual) của nhà sản xuất thiết bị', h: 'Tấm pin, inverter, MBA, tủ RMU, logger, trạm thời tiết...' },
        { c: 'HS-18', t: 'Quy trình vận hành, quy trình thao tác đóng cắt, xử lý sự cố, phiếu công tác / LOTO' },
        { c: 'HS-19', t: 'Chứng nhận bảo hành: tấm pin, inverter, MBA, kết cấu, chống thấm mái', h: 'Ghi lại ngày bắt đầu, thời hạn, điều kiện mất bảo hành.' },
        { c: 'HS-20', t: 'Đầu mối liên hệ bảo hành của EPC và nhà cung cấp, thời gian phản hồi cam kết' },
        { c: 'HS-21', t: 'Hợp đồng bảo hiểm tài sản / trách nhiệm (nếu có)' },
        { c: 'HS-22', t: 'Bàn giao tài khoản quản trị: monitoring/SCADA, inverter, logger, router, camera', h: 'Quyền admin; đổi mật khẩu sau khi nhận.' },
        { c: 'HS-23', t: 'Danh mục vật tư, phụ tùng dự phòng và dụng cụ bàn giao' },
        { c: 'HS-24', t: 'Hồ sơ môi trường (ĐTM / kế hoạch bảo vệ môi trường) và các cam kết liên quan', s: 'ground float' },
        { c: 'HS-25', t: 'Nhật ký vận hành, sổ sự cố từ COD đến nay; danh sách tồn tại (punch list) của EPC' },
        { c: 'HS-26', t: 'Hợp đồng thuê mái/đất, quy định ra vào khu vực, đầu mối phía chủ nhà xưởng / chủ đất' },
        { c: 'HQ-06', t: 'Đào tạo vận hành cho đội O&M đã hoàn thành (có biên bản đào tạo)' }
      ]
    },
    {
      id: 'TL', title: 'Hệ thống thang lên mái (Ladder)',
      items: [
        { c: 'TL-01', t: 'Thang lắp đặt phù hợp bản vẽ mặt bằng được phê duyệt', s: 'roof' },
        { c: 'TL-02', t: 'Chất lượng mối hàn đảm bảo', s: 'roof' },
        { c: 'TL-03', t: 'Vị trí hàn được sơn kẽm và sơn chống rỉ', s: 'roof' },
        { c: 'TL-04', t: 'Tất cả bulong, đai ốc được siết đúng lực, có đánh dấu marking', s: 'roof' },
        { c: 'TL-05', t: 'Vị trí liên kết giữa thang và công trình đảm bảo chắc chắn', s: 'roof' },
        { c: 'TL-06', t: 'Có cửa chống leo thang', s: 'roof' },
        { c: 'TL-07', t: 'Thang không bị rỉ sét', s: 'roof' },
        { c: 'TL-08', t: 'Vật liệu sử dụng đảm bảo không bị rỉ sét', s: 'roof' },
        { c: 'TL-09', t: 'Thang có lồng bảo vệ (thang lồng) / lan can bảo vệ (thang bậc)', s: 'roof' },
        { c: 'TL-10', t: 'Có biển báo cấm trèo, biển báo nguy hiểm tại thang', s: 'roof' },
        { c: 'TL-11', t: 'Có biển báo yêu cầu mặc đồ bảo hộ tại thang', s: 'roof' }
      ]
    },
    {
      id: 'LC', title: 'Lan can bảo vệ & dây cứu sinh (Guardrails, Lifeline)',
      items: [
        { c: 'LC-01', t: 'Lắp đặt phù hợp bản vẽ mặt bằng được phê duyệt', s: 'roof' },
        { c: 'LC-02', t: 'Các chi tiết không bị rỉ sét', s: 'roof' },
        { c: 'LC-03', t: 'Chân trụ chắc chắn, không gây thấm dột trên mặt mái', s: 'roof' },
        { c: 'LC-04', t: 'Vật liệu sử dụng đảm bảo không bị rỉ sét', s: 'roof' },
        { c: 'LC-05', t: 'Chất lượng mối hàn đảm bảo', s: 'roof' },
        { c: 'LC-06', t: 'Vị trí hàn được sơn kẽm và sơn chống rỉ', s: 'roof' },
        { c: 'LC-07', t: 'Tất cả bulong, đai ốc được siết đúng lực, có đánh dấu marking', s: 'roof' },
        { c: 'LC-08', t: 'Tất cả các mái đều được lắp dây cứu sinh hoặc lan can bảo vệ', s: 'roof' },
        { c: 'AT-06', t: 'Dây cứu sinh (lifeline), điểm neo dây an toàn còn hạn kiểm định', s: 'roof' }
      ]
    },
    {
      id: 'ST', title: 'Sàn thao tác (Walkway)',
      items: [
        { c: 'ST-01', t: 'Lắp đặt phù hợp bản vẽ mặt bằng được phê duyệt', s: 'roof' },
        { c: 'KC-07', t: 'Lối đi bảo trì đủ và chắc chắn, không phải đi trực tiếp trên tôn hoặc tấm pin', s: 'roof' },
        { c: 'ST-02', t: 'Các chi tiết không bị rỉ sét', s: 'roof' },
        { c: 'ST-03', t: 'Chất lượng mối hàn đảm bảo', s: 'roof' },
        { c: 'ST-04', t: 'Vị trí hàn được sơn kẽm và sơn chống rỉ', s: 'roof' },
        { c: 'ST-05', t: 'Tất cả bulong, đai ốc được siết đúng lực, có đánh dấu marking', s: 'roof' },
        { c: 'ST-06', t: 'Kiểm tra chống thấm sau khi lắp L-feet và rail nhôm', s: 'roof' }
      ]
    },
    {
      id: 'PV', title: 'Tấm pin năng lượng mặt trời (PV module)',
      items: [
        { c: 'PV-11', t: 'Bố trí tấm pin phù hợp bản vẽ mặt bằng được phê duyệt' },
        { c: 'PV-06', t: 'Đúng chủng loại, công suất, số lượng theo thiết kế; nhãn và serial còn đọc được', h: 'Ghi số lượng thực tế nếu khác hồ sơ.' },
        { c: 'PV-01', t: 'Ngoại quan: không có tấm pin vỡ kính, nứt, cong vênh, trầy xước sâu', h: 'Chụp ảnh từng tấm lỗi, ghi vị trí (dãy / string / số thứ tự).' },
        { c: 'PV-02', t: 'Không cháy, đổi màu, phồng rộp backsheet, tách lớp (delamination)' },
        { c: 'PV-03', t: 'Không có vết snail trail, ố vàng EVA, ăn mòn ribbon / busbar' },
        { c: 'PV-04', t: 'Khung nhôm nguyên vẹn, không móp méo, không ăn mòn' },
        { c: 'PV-05', t: 'Hộp nối (junction box) kín, không nứt, không cháy; cáp ra không bị kéo căng' },
        { c: 'PV-12', t: 'Các tấm pin được lắp thẳng hàng' },
        { c: 'PV-10', t: 'Lực siết ngàm kẹp 14 Nm, có đánh dấu marking; kẹp đúng vùng kẹp theo hướng dẫn NSX', h: 'Kẹp sai vùng có thể làm mất bảo hành tấm pin.' },
        { c: 'PV-13', t: 'Kiểm tra điện áp các chuỗi (string)', u: 'V' },
        { c: 'PV-07', t: 'Không có vật cản gây đổ bóng, nguồn gây bụi bẩn (nguyên nhân giảm hiệu suất)', h: 'Ghi vị trí cây, ăng-ten, ống khói, quạt hút xưởng...' },
        { c: 'PV-14', t: 'Không có vật thể có nguy cơ đổ, rơi vào giàn pin' },
        { c: 'PV-09', t: 'Khoảng cách lắp đặt giữa các tấm pin và giữa các hàng đúng thiết kế' },
        { c: 'PV-15', t: 'Lắp đặt tấm pin đúng tiêu chuẩn của nhà sản xuất' },
        { c: 'PV-08', t: 'Quét camera nhiệt: các tấm pin bình thường, không có hotspot', u: '°C', h: 'Ghi ΔT lớn nhất. Chụp IR khi bức xạ ≥ 600 W/m².' },
        { c: 'PV-16', t: 'Tấm pin đang ở hiện trạng sạch sẽ, không bụi bẩn' }
      ]
    },
    {
      id: 'KC', title: 'Khung giá đỡ & rail nhôm (Mounting structure)',
      items: [
        { c: 'KC-13', t: 'Khung giá đỡ phù hợp bản vẽ mặt bằng được phê duyệt' },
        { c: 'KC-01', t: 'Khung, ray, thanh giằng không biến dạng; đúng góc nghiêng (tilt) và hướng thiết kế' },
        { c: 'KC-14', t: 'Khoảng cách các thanh rail phù hợp' },
        { c: 'KC-15', t: 'Chủng loại sử dụng đồng đều, cùng chất liệu và hình dạng' },
        { c: 'KC-02', t: 'Khung chịu lực không rỉ sét bất thường; vết cắt, lỗ khoan đã được sơn xử lý' },
        { c: 'KC-05', t: 'Các vị trí vít bắn (chân đế, kẹp tôn) đã xử lý chống thấm chắc chắn', s: 'roof' },
        { c: 'KC-16', t: 'Các liên kết đúng theo hướng dẫn lắp đặt của nhà sản xuất' },
        { c: 'KC-03', t: 'Tất cả bulong, đai ốc được siết đúng lực, có đánh dấu marking' },
        { c: 'KC-17', t: 'Nối rail được lắp đặt chắc chắn' },
        { c: 'KC-04', t: 'Không có tiếp xúc trực tiếp giữa kim loại khác loại gây ăn mòn điện hóa (có đệm cách ly)' },
        { c: 'KC-06', t: 'Mái lắp pin không bị võng, biến dạng bất thường; máng xối thông thoáng', s: 'roof' },
        { c: 'KC-08', t: 'Móng cọc / móng bê tông không nứt, lún, xói lở; cao độ đúng thiết kế', s: 'ground' },
        { c: 'KC-09', t: 'Khoảng cách từ mép dưới tấm pin đến mặt đất đủ, không bị ngập hoặc cỏ che', s: 'ground' },
        { c: 'KC-10', t: 'Phao nổi không nứt, thủng, biến dạng; liên kết giữa các phao chắc chắn', s: 'float' },
        { c: 'KC-11', t: 'Hệ neo, dây neo, điểm neo bờ đúng thiết kế, không mòn hoặc chùng bất thường', s: 'float' },
        { c: 'KC-12', t: 'Lối đi trên phao, lan can, thiết bị cứu sinh (áo phao, phao tròn) đầy đủ', s: 'float' }
      ]
    },
    {
      id: 'TT', title: 'Trạm thời tiết (Weather station)',
      items: [
        { c: 'TT-01', t: 'Lắp đặt phù hợp bản vẽ được phê duyệt' },
        { c: 'TT-02', t: 'Giá đỡ và hộp đấu nối chắc chắn' },
        { c: 'TT-03', t: 'Ngăn ngừa rỉ sét bằng sơn chống rỉ hoặc vật liệu chống rỉ' },
        { c: 'TT-04', t: 'Dây tín hiệu đi trong ống chống tia UV, đầu ống được bịt chống xâm nhập' },
        { c: 'TT-05', t: 'Thông số hoạt động của cảm biến khớp với hệ thống giám sát' },
        { c: 'TT-06', t: 'Vị trí gắn các cảm biến chắc chắn; cảm biến bức xạ cân bằng, đúng góc' },
        { c: 'TT-07', t: 'Cảm biến lắp tại vị trí không có nguồn gây bụi trực tiếp' },
        { c: 'TT-08', t: 'Cảm biến nhiệt độ không lắp gần nguồn nhiệt (cục nóng điều hòa, chiller...)' },
        { c: 'TT-09', t: 'Các thiết bị không có bất thường về ngoại quan' },
        { c: 'TT-10', t: 'Cảm biến bức xạ (pyranometer) còn hạn hiệu chuẩn', h: 'Ghi ngày hết hạn hiệu chuẩn vào ghi chú.' }
      ]
    },
    {
      id: 'TD', title: 'Hệ thống tiếp địa & chống sét (Grounding)',
      items: [
        { c: 'TD-06', t: 'Hệ thống tiếp địa phù hợp bản vẽ được phê duyệt' },
        { c: 'TD-07', t: 'Tất cả bulong và ngàm tiếp địa được lắp đặt chắc chắn, đúng kỹ thuật' },
        { c: 'TD-08', t: 'Thang lên mái được lắp đặt tiếp địa', s: 'roof' },
        { c: 'TD-09', t: 'Dây cứu sinh và lan can được lắp đặt tiếp địa', s: 'roof' },
        { c: 'TD-10', t: 'Sàn thao tác được lắp đặt tiếp địa', s: 'roof' },
        { c: 'TD-11', t: 'Rail nhôm / khung giá đỡ được lắp đặt tiếp địa' },
        { c: 'TD-12', t: 'Các tấm pin được lắp đầy đủ lá thép (kẹp) tiếp địa' },
        { c: 'TD-13', t: 'Khung nhà inverter được lắp đặt tiếp địa' },
        { c: 'TD-14', t: 'Máng cáp DC/AC đều được lắp đặt tiếp địa' },
        { c: 'TD-15', t: 'Các tủ điện được lắp đặt tiếp địa' },
        { c: 'TD-01', t: 'Khung pin, giá đỡ, máng cáp kim loại được liên kết đẳng thế liên tục' },
        { c: 'TD-17', t: 'Kiểm tra thông mạch tiếp địa tại các vị trí liên kết' },
        { c: 'TD-02', t: 'Dây tiếp địa đúng tiết diện, màu vàng – xanh; đầu cốt, bulong tiếp địa không rỉ sét' },
        { c: 'TD-19', t: 'Dây tiếp địa dùng loại chuyên dụng, có nhãn chỉ danh hai đầu' },
        { c: 'TD-05', t: 'Có hộp kiểm tra (test box); hố kiểm tra có nắp, đánh dấu, dễ tiếp cận' },
        { c: 'TD-16', t: 'Có hệ thống cọc tiếp địa độc lập' },
        { c: 'TD-03', t: 'Điện trở đất nằm trong ngưỡng quy định (< 4 Ω)', u: 'Ω', h: 'Theo form GY: < 4 Ω. Ghi giá trị đo được.' },
        { c: 'TD-04', t: 'Kim thu sét, dây thoát sét đúng vị trí; vùng bảo vệ bao phủ dàn pin; không đổ bóng lên tấm pin' },
        { c: 'TD-18', t: 'Đảm bảo khuyến cáo kỹ thuật của nhà cung cấp và tiêu chuẩn hiện hành' }
      ]
    },
    {
      id: 'NV', title: 'Hệ thống nước vệ sinh (Cleaning system)',
      items: [
        { c: 'NV-01', t: 'Hệ thống nước phù hợp bản vẽ được phê duyệt' },
        { c: 'NV-02', t: 'Các đầu nối van được siết chặt' },
        { c: 'NV-03', t: 'Bơm hoạt động bình thường' },
        { c: 'NV-04', t: 'Giá đỡ bồn chứa nước hoàn thiện' },
        { c: 'NV-05', t: 'Dây cấp nguồn bơm hoàn thiện' },
        { c: 'NV-06', t: 'Các ống dẫn đi thẳng hàng, không cong, vẹo, võng' },
        { c: 'NV-07', t: 'Thiết bị không bị ảnh hưởng do quá trình thi công' },
        { c: 'NV-08', t: 'Đồng hồ nước có hộp chống mở van' },
        { c: 'NV-09', t: 'Bơm nước, phao cơ, phao điện hoạt động bình thường' },
        { c: 'NV-10', t: 'Dây phao điện được lắp đặt an toàn, bảo vệ dây dẫn tốt' },
        { c: 'NV-11', t: 'Bơm lắp đặt có mái che và bảo vệ bơm' },
        { c: 'NV-12', t: 'Dây điện của hệ thống bơm đi trong ống ruột gà chống tia UV' },
        { c: 'NV-13', t: 'Đường ống nước không bị rò rỉ' },
        { c: 'NV-14', t: 'Kẹp cố định ống nước chắc chắn; ốc vít và ngàm là loại nhúng nóng hoặc inox' },
        { c: 'NV-15', t: 'Vật liệu sử dụng đảm bảo không bị rỉ sét' },
        { c: 'NV-16', t: 'Các vị trí hàn, cắt được sơn chống rỉ và sơn màu' },
        { c: 'NV-17', t: 'Kiểm tra nước tại vị trí vòi xa nhất' },
        { c: 'NV-18', t: 'Chốt chỉ số công tơ nước', u: 'm³', h: 'Chụp ảnh mặt đồng hồ, ghi số serial vào ghi chú.' },
        { c: 'NV-19', t: 'Khóa nước xả, khóa cấp tại vị trí bể nước hoạt động tốt' },
        { c: 'NV-20', t: 'Bể nước được lắp đặt chắc chắn, đảm bảo kỹ thuật' }
      ]
    },
    {
      id: 'NI', title: 'Nhà inverter (Inverter house)',
      items: [
        { c: 'NI-01', t: 'Chất lượng mối hàn đảm bảo' },
        { c: 'NI-02', t: 'Cao độ giá đỡ theo bản vẽ thi công được phê duyệt' },
        { c: 'NI-03', t: 'Tất cả bulong, đai ốc được siết đúng lực, có đánh dấu marking' },
        { c: 'NI-04', t: 'Vị trí hàn được sơn kẽm và sơn chống rỉ' },
        { c: 'NI-05', t: 'Vị trí lắp đặt theo bản vẽ thi công được phê duyệt' },
        { c: 'NI-06', t: 'Các điểm cắt được làm phẳng và sơn' },
        { c: 'NI-07', t: 'Có đèn chiếu sáng và ổ cắm phục vụ bảo trì' },
        { c: 'NI-08', t: 'Móng chân trụ được đổ bê tông vuông vắn' },
        { c: 'NI-09', t: 'Đầu sắt hộp được bịt kín' },
        { c: 'NI-10', t: 'Vật liệu sử dụng đảm bảo không bị rỉ sét' },
        { c: 'NI-11', t: 'Thoát nước tốt, không bị ngập' },
        { c: 'NI-12', t: 'Hệ thống chiếu sáng tự dùng hoạt động tốt' },
        { c: 'NI-13', t: 'Không có nguồn nhiệt, nguồn gây bụi xung quanh' },
        { c: 'NI-14', t: 'Thông gió / thoát nhiệt của nhà inverter tốt' }
      ]
    },
    {
      id: 'INV', title: 'Inverter',
      items: [
        { c: 'INV-14', t: 'Bố trí inverter phù hợp bản vẽ mặt bằng được phê duyệt' },
        { c: 'INV-01', t: 'Đúng chủng loại, số lượng; serial khớp với hồ sơ' },
        { c: 'INV-13', t: 'Dấu và thẻ tên nhận dạng inverter theo tiêu chuẩn được phê duyệt' },
        { c: 'INV-15', t: 'Thẻ tên cáp đúng như bản vẽ thi công được phê duyệt' },
        { c: 'INV-16', t: 'Thứ tự string đầu vào inverter phù hợp với bản vẽ' },
        { c: 'INV-02', t: 'Lắp đặt chắc chắn, tránh tiếp xúc trực tiếp với ánh nắng; có mái che mưa', h: 'Inverter bị nắng chiếu trực tiếp dễ giảm công suất do quá nhiệt (derating).' },
        { c: 'INV-21', t: 'Khoảng cách giữa các inverter và với tường đủ không gian thao tác theo khuyến cáo NSX (vd. tháo quạt tản nhiệt)' },
        { c: 'INV-17', t: 'Tất cả nắp, khớp nối và van đều kín và chặt' },
        { c: 'INV-18', t: 'Sơn bề mặt sạch, không bị hư hại, hoặc đã sửa chữa phù hợp' },
        { c: 'INV-04', t: 'Nối đất vỏ inverter đúng, tiết diện dây đủ' },
        { c: 'INV-19', t: 'Điểm trung tính, tiếp địa ở tình trạng tốt' },
        { c: 'INV-05', t: 'Đầu cáp đúng chuẩn, kết nối DC / AC được cố định chắc chắn, gland kín' },
        { c: 'INV-20', t: 'Hai đầu kết nối đúng theo bản vẽ thi công được phê duyệt' },
        { c: 'INV-22', t: 'Bulong, đai ốc cosse AC được siết đúng lực, có đánh dấu marking' },
        { c: 'INV-06', t: 'Công tắc DC tích hợp (DC switch) thao tác tốt' },
        { c: 'INV-03', t: 'Quạt tản nhiệt, lưới lọc sạch, hoạt động bình thường' },
        { c: 'INV-07', t: 'Inverter đang vận hành bình thường, không có lỗi hoặc cảnh báo đang tồn tại' },
        { c: 'INV-08', t: 'Đã xem lịch sử lỗi (event log) từ COD; ghi nhận các lỗi lặp lại', h: 'Ghi mã lỗi lặp lại vào ghi chú.' },
        { c: 'INV-09', t: 'Phiên bản firmware đã ghi nhận và là bản được NSX khuyến nghị' },
        { c: 'INV-10', t: 'Thông số cài đặt (grid code, giới hạn công suất, Cosφ, chống phát ngược) đúng bản phê duyệt' },
        { c: 'INV-23', t: 'Nhiệt độ làm việc tại vỏ ngoài inverter trong ngưỡng (≤ 60 °C)', u: '°C' },
        { c: 'INV-24', t: 'Nhiệt độ các đầu cosse AC', u: '°C' },
        { c: 'INV-25', t: 'Nhiệt độ jack MC4 tại inverter', u: '°C' },
        { c: 'INV-26', t: 'Nhiệt độ dây AC inverter', u: '°C' },
        { c: 'INV-27', t: 'Nhiệt độ dây DC tại inverter', u: '°C' },
        { c: 'INV-28', t: 'Độ ồn làm việc của inverter trong ngưỡng (≤ 70 dB)', u: 'dB' },
        { c: 'INV-11', t: 'Công suất phát giữa các inverter / MPPT cùng cấu hình chênh lệch nhỏ', u: '%', x: 1 },
        { c: 'INV-12', t: 'Giá trị điện trở cách điện (Riso) hiển thị trên inverter trong giới hạn', u: 'kΩ', x: 1 }
      ]
    },
    {
      id: 'DC', title: 'Cáp DC/AC & đấu nối',
      items: [
        { c: 'DC-01', t: 'Chủng loại và tiết diện cáp đúng theo danh mục cáp (cáp DC loại solar H1Z2Z2-K / PV1-F)' },
        { c: 'DC-07', t: 'Nhãn cáp tại hai đầu đầy đủ (string + / −), khớp với sơ đồ hoàn công' },
        { c: 'DC-02', t: 'Cáp được cố định bằng dây rút chống UV hoặc kẹp inox; không treo lơ lửng' },
        { c: 'DC-14', t: 'Vỏ bọc cáp không bị hư hỏng; cáp ở tình trạng tốt, được bịt kín' },
        { c: 'DC-15', t: 'Cáp được sắp xếp gọn gàng theo từng chuỗi' },
        { c: 'DC-03', t: 'Dây DC không chạm mái, không nằm trực tiếp trên mặt đất / mặt nước; bán kính uốn đúng quy định' },
        { c: 'DC-18', t: 'Tất cả cáp AC/DC đi trong máng cáp, hầm cáp, ống cáp; không lộ trực tiếp bên ngoài' },
        { c: 'DC-16', t: 'Ống bảo vệ cáp được bơm keo kín chống nước, côn trùng' },
        { c: 'DC-08', t: 'Không có nguy cơ chạm vật sắc gây xước, hư, gãy hoặc bẻ gập cáp; cáp + và − cùng string đi song song' },
        { c: 'DC-04', t: 'Jack MC4 kết nối chắc chắn, hai đầu cùng hãng, cùng chủng loại (không lai hãng)', h: 'Connector lai hãng là nguyên nhân cháy phổ biến và làm mất bảo hành.' },
        { c: 'DC-05', t: 'Jack MC4 không lỏng, không vô nước; không có dấu hiệu cháy, biến màu' },
        { c: 'DC-17', t: 'Tất cả đầu cáp AC có áo cosse phù hợp' },
        { c: 'DC-06', t: 'Ống luồn cáp có nắp / đầu ống được bịt kín, chống UV' },
        { c: 'DC-13', t: 'Cáp chôn ngầm có băng báo cáp, mốc báo hiệu, độ sâu đúng thiết kế', s: 'ground' },
        { c: 'DC-09', t: 'Đo Voc từng string', u: 'V', x: 1 },
        { c: 'DC-10', t: 'Đo Isc / dòng làm việc từng string', u: 'A', x: 1 },
        { c: 'DC-11', t: 'Kiểm tra cực tính đúng trên toàn bộ string', x: 1 },
        { c: 'DC-12', t: 'Đo điện trở cách điện string (+/PE, −/PE)', u: 'MΩ', x: 1 }
      ]
    },
    {
      id: 'MC', title: 'Máng cáp (Basket tray)',
      items: [
        { c: 'MC-01', t: 'Nắp máng cáp lắp đặt chắc chắn, bịt hai đầu' },
        { c: 'MC-02', t: 'Máng cáp, giá đỡ máng cáp không bị rỉ sét' },
        { c: 'MC-03', t: 'Máng cáp đảm bảo chống thấm' },
        { c: 'MC-04', t: 'Máng cáp không có dấu hiệu chuột, bọ sinh sống' },
        { c: 'MC-05', t: 'Bulong liên kết máng cáp lắp đặt chắc chắn, có đánh dấu marking' }
      ]
    },
    {
      id: 'CB', title: 'Tủ DC / Combiner box',
      items: [
        { c: 'CB-01', t: 'Vỏ tủ nguyên vẹn, cấp bảo vệ phù hợp (ngoài trời ≥ IP65), có khóa', h: 'Đánh dấu N/A cả mục nếu dùng string inverter không có tủ DC.' },
        { c: 'CB-02', t: 'Ốc siết cáp (cable gland) kín; lỗ chờ không dùng đã được bịt' },
        { c: 'CB-03', t: 'Cầu chì string đúng định mức DC, đủ cả hai cực (nếu thiết kế yêu cầu)' },
        { c: 'CB-04', t: 'Chống sét DC (SPD) đúng loại, cửa sổ chỉ thị còn tốt' },
        { c: 'CB-05', t: 'Cầu dao / công tắc cách ly DC đúng định mức DC, thao tác tốt' },
        { c: 'CB-06', t: 'Đầu cốt, đầu dây siết chặt; ảnh nhiệt không có điểm phát nhiệt', u: '°C' },
        { c: 'CB-07', t: 'Nhãn nhận diện tủ và nhãn cảnh báo "Điện DC – vẫn còn điện khi đã cắt"' }
      ]
    },
    {
      id: 'AC', title: 'Tủ điện (Cabinet)',
      items: [
        { c: 'AC-10', t: 'Tủ điện phù hợp bản vẽ được phê duyệt' },
        { c: 'AC-01', t: 'Tủ điện sạch sẽ, chống xâm nhập tốt; cửa, khóa, cấp IP phù hợp, có lưới chắn chuột' },
        { c: 'AC-11', t: 'Đầy đủ chỉ danh các dây cáp' },
        { c: 'AC-08', t: 'Đầy đủ nhãn tên thiết bị; sơ đồ một sợi và biển cảnh báo điện áp' },
        { c: 'AC-18', t: 'Bản vẽ thiết kế, hướng dẫn vận hành được đặt trong tủ' },
        { c: 'AC-12', t: 'Lớp bọc cách điện thanh cái tốt, không bị hư hại' },
        { c: 'AC-03', t: 'Tất cả bulong, đai ốc được siết đúng lực, có đánh dấu marking; ảnh nhiệt không có điểm nóng', u: '°C', h: 'Ghi ΔT lớn nhất giữa các pha. ΔT > 10 °C cần kiểm tra lại.' },
        { c: 'AC-13', t: 'Vị trí cáp vào tủ (PG) được bịt kín bằng đất sét chống côn trùng' },
        { c: 'AC-14', t: 'Quạt tản nhiệt hoạt động tốt, lưới lọc bụi sạch' },
        { c: 'AC-02', t: 'MCCB / ACB / CB đúng định mức theo SLD; cài đặt bảo vệ đúng phiếu chỉnh định' },
        { c: 'AC-09', t: 'MCCB / ACB / CB hoạt động tốt; cuộn cắt (shunt trip) và nút dừng khẩn cấp hoạt động đúng' },
        { c: 'AC-04', t: 'Chống sét AC (SPD) chỉ thị tốt; có MCB / cầu chì bảo vệ SPD' },
        { c: 'AC-05', t: 'Công tơ, đồng hồ đa năng trong tủ hiển thị bình thường; TI đúng tỉ số' },
        { c: 'AC-06', t: 'Liên động cơ / điện giữa các máy cắt hoạt động đúng (nếu có)' },
        { c: 'AC-07', t: 'Cáp AC đúng tiết diện, có nhãn pha, đầu cáp được bọc co nhiệt' },
        { c: 'AC-15', t: 'Kiểm tra trực quan các thiết bị điện khác trong tủ' },
        { c: 'AC-16', t: 'Chân tủ điện được cố định chắc chắn' },
        { c: 'AC-17', t: 'Nhiệt độ làm việc của các thiết bị trong tủ', u: '°C' },
        { c: 'AC-19', t: 'Nhiệt độ tủ SDB Solar', u: '°C' },
        { c: 'AC-20', t: 'Nhiệt độ tại các thanh cái (busbar)', u: '°C' }
      ]
    },
    {
      id: 'GS', title: 'Giám sát, tủ monitoring & Internet',
      items: [
        { c: 'GS-01', t: 'Datalogger / SCADA online, thu đủ dữ liệu từ tất cả inverter, công tơ, cảm biến' },
        { c: 'GS-02', t: 'Sản lượng trên hệ thống giám sát khớp với công tơ', u: '%', h: 'Ghi % sai lệch trong cùng kỳ. Yêu cầu thường ≤ 2 %.' },
        { c: 'GS-04', t: 'Cảnh báo (email / app / SMS) đã được cấu hình gửi tới đội O&M' },
        { c: 'GS-06', t: 'Truy cập từ xa vào inverter / logger hoạt động; mật khẩu mặc định đã được đổi' },
        { c: 'GS-07', t: 'Kết nối và truyền dữ liệu về trung tâm điều độ / điện lực hoạt động (nếu yêu cầu)' },
        { c: 'GS-08', t: 'Camera giám sát và đầu ghi hoạt động, thời gian lưu trữ đủ theo yêu cầu' },
        { c: 'GS-09', t: 'Tủ giám sát có đầy đủ bảng tên' },
        { c: 'GS-10', t: 'Dây điện bên trong tủ giám sát được gắn thẻ tên đầy đủ' },
        { c: 'GS-11', t: 'Dây điện bên trong tủ đi gọn gàng, không hư hỏng, xước hoặc gãy gập' },
        { c: 'GS-12', t: 'Dây vào tủ giám sát đi trong ống ruột gà và được bịt bằng đất sét' },
        { c: 'GS-13', t: 'Các thiết bị trong tủ giám sát lắp đặt chắc chắn và thẩm mỹ' },
        { c: 'GS-14', t: 'Nhiệt độ tủ monitoring', u: '°C' },
        { c: 'GS-15', t: 'Thiết bị Internet lắp đặt chắc chắn, đi dây gọn gàng' },
        { c: 'GS-16', t: 'Cáp quang được đi gọn gàng trong ống gen' },
        { c: 'GS-05', t: 'Kết nối Internet ổn định, có đường dự phòng; router / switch có nguồn UPS' },
        { c: 'GS-17', t: 'Thông tin Internet chính xác (tài khoản, mật khẩu wifi; tài khoản đăng nhập router)' },
        { c: 'GS-03', t: 'Trạm thời tiết: cảm biến bức xạ sạch, cân bằng, còn hạn hiệu chuẩn', x: 1 }
      ]
    },
    {
      id: 'KB', title: 'Ổ khóa & biển cảnh báo',
      items: [
        { c: 'KB-01', t: 'Có khóa số tại vị trí thang leo', h: 'Ghi mã khóa vào ghi chú nếu được phép.' },
        { c: 'KB-02', t: 'Có khóa số tại vị trí nhà inverter' },
        { c: 'KB-03', t: 'Có khóa số tại vị trí công tơ nước' },
        { c: 'KB-04', t: 'Có sứ báo cáp ngầm hoặc cảnh báo chiều cao cầu cáp' },
        { c: 'KB-05', t: 'Biển cảnh báo khu vực cấm tại vị trí thang leo' },
        { c: 'KB-06', t: 'Biển cảnh báo nguy hiểm, cấm vào tại nhà inverter' },
        { c: 'KB-07', t: 'Biển cảnh báo điện áp cao tại các tủ điện' },
        { c: 'KB-08', t: 'Biển thông tin công trình tại nhà inverter' }
      ]
    },
    {
      id: 'MB', title: 'Mặt bằng sau thi công & hạ tầng',
      items: [
        { c: 'MB-08', t: 'Các nguy cơ dột đã được xử lý', s: 'roof' },
        { c: 'MB-09', t: 'Tôn không bị gãy sóng', s: 'roof' },
        { c: 'MB-10', t: 'Khu vực mặt bằng đã được vệ sinh' },
        { c: 'MB-11', t: 'Không có nguy cơ rỉ sét do quá trình thi công (mạt sắt, vết cắt...)' },
        { c: 'MB-12', t: 'Rác thải và pin vỡ đã được di chuyển ra khỏi công trình' },
        { c: 'MB-07', t: 'Không có nguồn bụi, khói, hơi hóa chất bất thường gần dàn pin (ống khói, quạt hút xưởng)', s: 'roof', h: 'Ghi vị trí nguồn bụi để tăng tần suất vệ sinh khu vực đó.' },
        { c: 'MB-01', t: 'Hàng rào, cổng, khóa nguyên vẹn; không có điểm xâm nhập', s: 'ground float' },
        { c: 'MB-02', t: 'Đường nội bộ đủ cho xe bảo trì, xe rửa pin đi lại', s: 'ground float' },
        { c: 'MB-03', t: 'Thoát nước mưa thông suốt; không xói lở, không ngập úng', s: 'ground' },
        { c: 'MB-04', t: 'Cỏ, thực vật được kiểm soát, không che bóng tấm pin', s: 'ground' },
        { c: 'MB-06', t: 'Nhà điều hành, kho phụ tùng, nhà vệ sinh, chốt bảo vệ sẵn sàng sử dụng', s: 'ground float' },
        { c: 'MB-05', t: 'Nguồn nước rửa pin (bể, bơm, họng nước) sẵn sàng; chất lượng nước phù hợp', x: 1 }
      ]
    },
    {
      id: 'TBA', title: 'Trạm biến áp & thiết bị trung thế (nếu có)',
      items: [
        { c: 'TBA-13', t: 'Không có cây trong phạm vi an toàn', h: 'Đánh dấu N/A cả mục nếu dự án đấu nối hạ thế, không có trạm riêng.' },
        { c: 'TBA-14', t: 'Sàn trạm biến áp được vệ sinh' },
        { c: 'TBA-15', t: 'Quan sát bằng mắt thường không có bất thường, hồ quang điện' },
        { c: 'TBA-01', t: 'Ngoại quan MBA: không rò rỉ dầu, không han rỉ, mức dầu đúng' },
        { c: 'TBA-02', t: 'Hạt hút ẩm (silicagel) bình thở chưa bão hòa (đổi màu chưa quá 2/3)' },
        { c: 'TBA-03', t: 'Đồng hồ nhiệt độ dầu / cuộn dây, rơ le hơi, van an toàn hoạt động và có tín hiệu về tủ điều khiển' },
        { c: 'TBA-04', t: 'Sứ cách điện sạch, không nứt vỡ; đầu cực không phát nhiệt', u: '°C' },
        { c: 'TBA-05', t: 'Nấc phân áp ở đúng vị trí vận hành' },
        { c: 'TBA-06', t: 'Tủ RMU / máy cắt trung thế: áp suất SF6 trong vùng xanh, chỉ thị trạng thái đúng' },
        { c: 'TBA-07', t: 'Rơ le bảo vệ cài đặt đúng phiếu chỉnh định, không có cảnh báo; nguồn DC / UPS cấp cho rơ le tốt' },
        { c: 'TBA-08', t: 'Chống sét van trung thế, bộ đếm sét; cáp và đầu cáp trung thế không có dấu hiệu phóng điện' },
        { c: 'TBA-09', t: 'Tiếp địa trung tính, vỏ MBA và vỏ tủ trung thế đầy đủ, chắc chắn' },
        { c: 'TBA-10', t: 'Đã lắp biển báo an toàn; hàng rào, cửa khóa, hố thu dầu, thông gió trạm' },
        { c: 'TBA-11', t: 'Dụng cụ an toàn trung thế: sào thao tác, găng, ủng cách điện, bút thử điện, tiếp địa di động còn hạn kiểm định' },
        { c: 'TBA-12', t: 'Ắc quy / UPS cho hệ thống điều khiển: điện áp tốt, có biên bản kiểm tra định kỳ', u: 'V' }
      ]
    },
    {
      id: 'AT', title: 'Phòng cháy chữa cháy & an toàn',
      items: [
        { c: 'AT-11', t: 'Bình bột và bình CO₂ được bố trí trong nhà biến tần, có giá đỡ hoặc tủ đầy đủ' },
        { c: 'AT-01', t: 'Bình chữa cháy đủ số lượng, đúng vị trí, có tem kiểm định còn hạn' },
        { c: 'AT-15', t: 'Bình chữa cháy được lắp đặt cạnh thang lên mái hoặc trên mái', s: 'roof' },
        { c: 'AT-12', t: 'Tủ báo cháy được lắp đặt chắc chắn' },
        { c: 'AT-13', t: 'Nhà biến tần được lắp đặt hệ thống báo cháy tự động' },
        { c: 'AT-02', t: 'Hệ thống báo cháy / chữa cháy hoạt động và đã được nghiệm thu' },
        { c: 'AT-14', t: 'Không có cây trong phạm vi an toàn' },
        { c: 'AT-16', t: 'Bảng nội quy – tiêu lệnh phòng cháy chữa cháy được lắp đặt' },
        { c: 'AT-03', t: 'Nút dừng khẩn cấp / thiết bị ngắt nhanh (rapid shutdown) hoạt động, có nhãn rõ ràng' },
        { c: 'AT-04', t: 'Biển cảnh báo nguy hiểm điện, sơ đồ thoát nạn đầy đủ' },
        { c: 'AT-07', t: 'Lối tiếp cận chữa cháy và khoảng trống giữa các cụm pin trên mái theo quy định PCCC', s: 'roof' },
        { c: 'AT-08', t: 'Tủ thuốc sơ cứu; bảng số điện thoại khẩn cấp (114, 115, điện lực, chủ đầu tư)' },
        { c: 'AT-09', t: 'Chiếu sáng khu vực trạm, tủ điện và chiếu sáng sự cố' },
        { c: 'AT-05', t: 'Thang lên mái cố định, có lồng bảo vệ và kiểm soát ra vào', s: 'roof', x: 1 },
        { c: 'AT-10', t: 'Vật liệu dễ cháy, rác thải xây dựng đã được dọn sạch', x: 1 }
      ]
    },
    {
      id: 'DD', title: 'Đo đếm & chốt chỉ số',
      items: [
        { c: 'DD-01', t: 'Công tơ hai chiều / công tơ ranh giới đúng chủng loại, còn hạn kiểm định, niêm phong đầy đủ' },
        { c: 'DD-02', t: 'Chỉ số công tơ phát lên lưới tại thời điểm bàn giao', u: 'kWh', h: 'Ghi số serial công tơ vào ghi chú, chụp ảnh mặt công tơ. Đây là mốc chốt sản lượng giữa hai bên.' },
        { c: 'DD-03', t: 'Chỉ số công tơ nhận từ lưới tại thời điểm bàn giao', u: 'kWh' },
        { c: 'DD-07', t: 'Sản lượng lũy kế từ COD đến ngày bàn giao', u: 'kWh' },
        { c: 'DD-08', t: 'Chốt chỉ số công tơ điện tự dùng / công tơ khách hàng cấp cho hệ thống', u: 'kWh', h: 'Ghi loại công tơ, S/N, chỉ số cũ – chỉ số mới vào ghi chú (theo mẫu FM-MSGY-OM-001).' },
        { c: 'DD-09', t: 'Biên bản xác nhận chỉ số điện, nước đã được ký với khách hàng', h: 'Mẫu FM-MSGY-OM-001.' },
        { c: 'DD-04', t: 'TU / TI đo đếm có tem kiểm định; hộp đấu dây được niêm phong' },
        { c: 'DD-05', t: 'Hệ thống chống phát ngược (zero export) / giới hạn công suất hoạt động đúng thỏa thuận', s: 'roof' },
        { c: 'DD-06', t: 'Điện áp, tần số, Cosφ tại điểm đấu nối nằm trong giới hạn cho phép' }
      ]
    },
    {
      id: 'VT', title: 'Vật tư dự phòng & dụng cụ',
      items: [
        { c: 'VT-01', t: 'Tấm pin dự phòng đủ số lượng theo hợp đồng, cùng model', u: 'tấm' },
        { c: 'VT-02', t: 'Connector MC4, cầu chì DC, SPD dự phòng', h: 'Ghi số lượng từng loại vào ghi chú.' },
        { c: 'VT-03', t: 'Inverter / bo mạch / quạt dự phòng (nếu có trong hợp đồng)' },
        { c: 'VT-04', t: 'Dụng cụ chuyên dụng bàn giao: kìm bấm MC4, khóa tháo MC4, cờ lê lực...' },
        { c: 'VT-05', t: 'Biên bản kiểm đếm vật tư dự phòng có xác nhận hai bên' }
      ]
    },
    {
      // Nhóm đã bỏ (hiệu suất). Chỉ hiện ở biên bản cũ đã có kết quả cho các hạng mục này.
      id: 'HQ', title: 'Hiệu suất vận hành (đã bỏ khỏi checklist)',
      items: [
        { c: 'HQ-01', t: 'Chỉ số hiệu suất PR (Performance Ratio) từ COD so với cam kết', u: '%', x: 1 },
        { c: 'HQ-02', t: 'Sản lượng thực tế so với dự báo (PVsyst) cùng kỳ', u: '%', x: 1 },
        { c: 'HQ-03', t: 'Hệ số khả dụng (Availability) của nhà máy', u: '%', x: 1 },
        { c: 'HQ-04', t: 'Không có string / inverter ngừng hoạt động hoặc sản lượng bằng 0', x: 1 },
        { c: 'HQ-05', t: 'Tồn tại của EPC chưa khắc phục đã được liệt kê, có cam kết thời hạn xử lý', x: 1 }
      ]
    }
  ]
};

/* ---------------------------------------------------------------------------
 * Cấu trúc khoa học: Phần (theo dòng năng lượng từ hồ sơ → dàn pin → DC → inverter → AC/lưới
 * → tiếp địa → giám sát → phụ trợ → an toàn → mặt bằng), trong mỗi nhóm chia nhóm con theo
 * trình tự: bố trí / lắp đặt → liên kết → vật liệu → đấu nối → vận hành → nhãn, biển báo → đo kiểm.
 * Chỉ sắp xếp lại thứ tự hiển thị; mã hạng mục giữ nguyên.
 * ------------------------------------------------------------------------- */
window.CHECKLIST.parts = [
  { id: 'A', title: 'Hồ sơ & tài liệu', secs: ['HS'] },
  { id: 'B', title: 'Lối tiếp cận & an toàn trên mái', secs: ['TL', 'LC', 'ST'] },
  { id: 'C', title: 'Dàn pin', secs: ['PV', 'KC'] },
  { id: 'D', title: 'Hệ thống DC & cáp', secs: ['DC', 'MC', 'CB'] },
  { id: 'E', title: 'Inverter', secs: ['NI', 'INV'] },
  { id: 'F', title: 'Hệ thống AC & đấu nối lưới', secs: ['AC', 'TBA', 'DD'] },
  { id: 'G', title: 'Tiếp địa & chống sét', secs: ['TD'] },
  { id: 'H', title: 'Giám sát & truyền thông', secs: ['GS', 'TT'] },
  { id: 'I', title: 'Hệ thống phụ trợ', secs: ['NV'] },
  { id: 'J', title: 'PCCC, khóa & biển báo', secs: ['AT', 'KB'] },
  { id: 'K', title: 'Mặt bằng & vật tư bàn giao', secs: ['MB', 'VT', 'HQ'] }
];
window.CHECKLIST.order = {
  HS: [['Pháp lý & hợp đồng', 'HS-01 HS-04 HS-02 HS-26 HS-21 HS-24'], ['Bản vẽ & thiết kế', 'HS-05 HS-06 HS-07'],
    ['Thiết bị & bảo hành', 'HS-08 HS-09 HS-19 HS-20'], ['Nghiệm thu & thí nghiệm', 'HS-03 HS-10 HS-12 HS-13 HS-14 HS-15 HS-16'],
    ['Vận hành & bàn giao', 'HS-17 HS-18 HS-22 HS-23 HS-25 HQ-06']],
  TL: [['Bố trí & lắp đặt', 'TL-01 TL-05 TL-09 TL-06'], ['Liên kết & chống rỉ', 'TL-02 TL-03 TL-04 TL-07 TL-08'], ['Biển báo', 'TL-10 TL-11']],
  LC: [['Bố trí & lắp đặt', 'LC-01 LC-08 LC-03'], ['Liên kết & chống rỉ', 'LC-05 LC-06 LC-07 LC-02 LC-04'], ['Kiểm định', 'AT-06']],
  ST: [['Bố trí & lắp đặt', 'ST-01 KC-07 ST-06'], ['Liên kết & chống rỉ', 'ST-03 ST-04 ST-05 ST-02']],
  PV: [['Bố trí & lắp đặt', 'PV-11 PV-06 PV-12 PV-09 PV-15 PV-10'], ['Ngoại quan tấm pin', 'PV-01 PV-02 PV-03 PV-04 PV-05 PV-16'],
    ['Môi trường xung quanh', 'PV-07 PV-14'], ['Đo kiểm', 'PV-13 PV-08']],
  KC: [['Bố trí & lắp đặt', 'KC-13 KC-01 KC-14 KC-15 KC-16'], ['Liên kết & lực siết', 'KC-03 KC-17'], ['Vật liệu & chống rỉ', 'KC-02 KC-04'],
    ['Mái & chống thấm', 'KC-05 KC-06'], ['Móng (mặt đất)', 'KC-08 KC-09'], ['Phao nổi', 'KC-10 KC-11 KC-12']],
  DC: [['Chủng loại & nhãn cáp', 'DC-01 DC-07'], ['Lắp đặt & bảo vệ cáp', 'DC-02 DC-15 DC-03 DC-18 DC-06 DC-16 DC-08 DC-13'],
    ['Tình trạng cáp & đầu nối', 'DC-14 DC-04 DC-05 DC-17']],
  MC: [['Lắp đặt', 'MC-01 MC-05 MC-03'], ['Tình trạng', 'MC-02 MC-04']],
  CB: [['Vỏ tủ & làm kín', 'CB-01 CB-02'], ['Thiết bị bảo vệ', 'CB-03 CB-04 CB-05'], ['Đấu nối & đo kiểm', 'CB-06'], ['Nhãn & cảnh báo', 'CB-07']],
  NI: [['Bố trí & kết cấu', 'NI-05 NI-02 NI-08 NI-01 NI-03'], ['Vật liệu & chống rỉ', 'NI-04 NI-06 NI-09 NI-10'],
    ['Môi trường vận hành', 'NI-11 NI-13 NI-14'], ['Chiếu sáng & ổ cắm', 'NI-07 NI-12']],
  INV: [['Bố trí & lắp đặt', 'INV-14 INV-01 INV-02 INV-21'], ['Nhãn & nhận dạng', 'INV-13 INV-15 INV-16'], ['Vỏ & làm kín', 'INV-17 INV-18 INV-03'],
    ['Đấu nối & tiếp địa', 'INV-05 INV-20 INV-22 INV-04 INV-19 INV-06'], ['Vận hành & cài đặt', 'INV-07 INV-08 INV-09 INV-10'],
    ['Đo kiểm nhiệt độ & độ ồn', 'INV-23 INV-24 INV-25 INV-26 INV-27 INV-28']],
  AC: [['Bố trí & vỏ tủ', 'AC-10 AC-16 AC-01 AC-13 AC-14'], ['Thiết bị đóng cắt & bảo vệ', 'AC-02 AC-09 AC-04 AC-06 AC-05 AC-15'],
    ['Thanh cái & đấu nối', 'AC-12 AC-03 AC-07'], ['Nhãn & tài liệu', 'AC-11 AC-08 AC-18'], ['Đo kiểm nhiệt độ', 'AC-17 AC-19 AC-20']],
  TBA: [['Mặt bằng trạm', 'TBA-13 TBA-14 TBA-10'], ['Máy biến áp', 'TBA-15 TBA-01 TBA-02 TBA-03 TBA-04 TBA-05'],
    ['Thiết bị trung thế & bảo vệ', 'TBA-06 TBA-07 TBA-08 TBA-09 TBA-12'], ['Dụng cụ an toàn', 'TBA-11']],
  DD: [['Công tơ & đo đếm', 'DD-01 DD-04 DD-05 DD-06'], ['Chốt chỉ số', 'DD-02 DD-03 DD-07 DD-08 DD-09']],
  TD: [['Thiết kế hệ thống', 'TD-06 TD-16 TD-05 TD-18'], ['Tiếp địa kết cấu & thiết bị', 'TD-08 TD-09 TD-10 TD-11 TD-12 TD-13 TD-14 TD-15 TD-01'],
    ['Dây & mối nối', 'TD-07 TD-02 TD-19'], ['Chống sét', 'TD-04'], ['Đo kiểm', 'TD-17 TD-03']],
  GS: [['Hệ thống giám sát', 'GS-01 GS-02 GS-04 GS-06 GS-07 GS-08'], ['Tủ monitoring', 'GS-09 GS-10 GS-11 GS-12 GS-13 GS-14'],
    ['Internet', 'GS-15 GS-16 GS-05 GS-17']],
  TT: [['Lắp đặt', 'TT-01 TT-02 TT-06 TT-04 TT-03'], ['Vị trí cảm biến', 'TT-07 TT-08'], ['Vận hành & hiệu chuẩn', 'TT-05 TT-10 TT-09']],
  NV: [['Bồn, bể & giá đỡ', 'NV-01 NV-20 NV-04 NV-19'], ['Bơm & điện', 'NV-03 NV-09 NV-05 NV-10 NV-11 NV-12'],
    ['Đường ống & van', 'NV-06 NV-02 NV-13 NV-14 NV-17'], ['Vật liệu & chống rỉ', 'NV-15 NV-16 NV-07'], ['Đồng hồ nước', 'NV-08 NV-18']],
  AT: [['Phương tiện chữa cháy', 'AT-11 AT-01 AT-15'], ['Báo cháy', 'AT-12 AT-13 AT-02'], ['An toàn & khẩn cấp', 'AT-03 AT-07 AT-14 AT-08 AT-09'],
    ['Nội quy & biển báo', 'AT-16 AT-04']],
  KB: [['Khóa', 'KB-01 KB-02 KB-03'], ['Biển cảnh báo & thông tin', 'KB-05 KB-06 KB-07 KB-04 KB-08']],
  MB: [['Mái & kết cấu sau thi công', 'MB-08 MB-09 MB-11'], ['Vệ sinh mặt bằng', 'MB-10 MB-12 MB-07'], ['Hạ tầng (mặt đất / nổi)', 'MB-01 MB-02 MB-03 MB-04 MB-06']],
  VT: [['Vật tư & dụng cụ', 'VT-01 VT-02 VT-03 VT-04 VT-05']]
};

// Áp dụng cấu trúc: sắp nhóm theo Phần, sắp hạng mục theo nhóm con (gán it.g).
(function (CL) {
  const partOf = {};
  CL.parts.forEach((p) => p.secs.forEach((id) => { partOf[id] = p; }));
  CL.sections.forEach((s) => {
    const p = partOf[s.id]; s.part = p ? p.id : 'Z'; s.partTitle = p ? p.title : 'Khác';
    const order = CL.order[s.id] || [];
    const byCode = {}; s.items.forEach((it) => { byCode[it.c] = it; });
    const used = new Set(); const items = [];
    order.forEach(([g, codes]) => codes.split(/\s+/).forEach((c) => {
      const it = byCode[c]; if (it && !used.has(c)) { it.g = g; used.add(c); items.push(it); }
    }));
    s.items.forEach((it) => { if (!used.has(it.c)) { it.g = it.x ? 'Đã bỏ khỏi checklist' : 'Khác'; items.push(it); } });
    s.items = items;
  });
  const rank = (s) => { const pi = CL.parts.findIndex((p) => p.id === s.part); const p = CL.parts[pi]; return (pi < 0 ? 99 : pi) * 100 + (p ? p.secs.indexOf(s.id) : 0); };
  CL.sections.sort((a, b) => rank(a) - rank(b));
})(window.CHECKLIST);
