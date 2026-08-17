const makeReview = (id, overallRating, cleanlinessRating, findabilityRating, facilityRating, content, createdAt) => ({
  id, overallRating, cleanlinessRating, findabilityRating, facilityRating, content,
  createdAt, updatedAt: createdAt, source: 'seed-demo'
})

export const TOILETS = Object.freeze([
  {
    id: 'ss-demo-001', name: '中心广场便民卫生间（演示）', region: '荆州市·沙市中心区',
    latitude: 30.3158, longitude: 112.2471, coordinateSystem: 'GCJ-02-DEMO',
    address: '沙市中心区演示点 A', entranceDescription: '从广场东侧入口进入，沿橙色导视下至地下一层。',
    floor: '地下一层', openingHours: '06:00–22:30', status: 'open', feeType: 'free',
    facilities: ['accessible', 'toilet-paper', 'hand-wash'], lastVerifiedAt: '2026-08-15T09:20:00+08:00',
    dataSource: '演示数据', isDemo: true,
    seedReviews: [
      makeReview('seed-001', 5, 5, 5, 4, '入口说明清楚，演示体验顺畅。', '2026-08-15T09:20:00+08:00'),
      makeReview('seed-002', 4, 4, 5, 4, '比较容易找到。', '2026-08-14T18:20:00+08:00')
    ]
  },
  {
    id: 'ss-demo-002', name: '便河公园公共卫生间（演示）', region: '荆州市·沙市中心区',
    latitude: 30.3177, longitude: 112.2503, coordinateSystem: 'GCJ-02-DEMO',
    address: '沙市中心区演示点 B', entranceDescription: '从公园北门进入后右转，沿步道前行约八十米。',
    floor: '地面层', openingHours: '05:30–23:00', status: 'open', feeType: 'free',
    facilities: ['family', 'hand-wash', 'toilet-paper'], lastVerifiedAt: '2026-08-14T18:45:00+08:00',
    dataSource: '演示数据', isDemo: true,
    seedReviews: [makeReview('seed-003', 5, 4, 5, 4, '公园入口方向明确。', '2026-08-14T18:45:00+08:00')]
  },
  {
    id: 'ss-demo-003', name: '江津路便民服务点（演示）', region: '荆州市·沙市中心区',
    latitude: 30.3202, longitude: 112.2444, coordinateSystem: 'GCJ-02-DEMO',
    address: '沙市中心区演示点 C', entranceDescription: '从便民服务中心正门进入，经过服务台后向左转。',
    floor: '一楼', openingHours: '工作日 08:30–17:30', status: 'uncertain', feeType: 'free',
    facilities: ['seated', 'hand-wash'], lastVerifiedAt: '2026-08-03T15:00:00+08:00',
    dataSource: '演示数据', isDemo: true,
    seedReviews: [makeReview('seed-004', 4, 4, 3, 4, '可能需要登记。', '2026-08-03T15:00:00+08:00')]
  },
  {
    id: 'ss-demo-004', name: '北京中路公共卫生间（演示）', region: '荆州市·沙市中心区',
    latitude: 30.3139, longitude: 112.2527, coordinateSystem: 'GCJ-02-DEMO',
    address: '沙市中心区演示点 D', entranceDescription: '沿街面紫色导视牌进入，入口位于建筑西侧。',
    floor: '地面层', openingHours: '全天', status: 'open', feeType: 'free',
    facilities: ['accessible', 'seated', 'toilet-paper'], lastVerifiedAt: '2026-08-13T11:00:00+08:00',
    dataSource: '演示数据', isDemo: true,
    seedReviews: [makeReview('seed-005', 4, 5, 4, 4, '设施信息完整。', '2026-08-13T11:00:00+08:00')]
  },
  {
    id: 'ss-demo-005', name: '文湖公园卫生间（演示）', region: '荆州市·沙市中心区',
    latitude: 30.3109, longitude: 112.2402, coordinateSystem: 'GCJ-02-DEMO',
    address: '沙市中心区演示点 E', entranceDescription: '从公园东门进入后沿主路直行，入口在儿童活动区旁。',
    floor: '地面层', openingHours: '06:00–22:00', status: 'open', feeType: 'free',
    facilities: ['family', 'accessible', 'hand-wash'], lastVerifiedAt: '2026-08-12T16:20:00+08:00',
    dataSource: '演示数据', isDemo: true,
    seedReviews: [makeReview('seed-006', 5, 4, 4, 5, '亲子设施标签很有用。', '2026-08-12T16:20:00+08:00')]
  },
  {
    id: 'ss-demo-006', name: '朝阳路便民卫生间（演示）', region: '荆州市·沙市中心区',
    latitude: 30.3128, longitude: 112.2584, coordinateSystem: 'GCJ-02-DEMO',
    address: '沙市中心区演示点 F', entranceDescription: '入口位于临街停车区南侧，跟随黄色地面标识进入。',
    floor: '地面层', openingHours: '07:00–21:00', status: 'closed', feeType: 'free',
    facilities: ['hand-wash'], lastVerifiedAt: '2026-08-15T08:10:00+08:00',
    dataSource: '演示数据', isDemo: true,
    seedReviews: [makeReview('seed-007', 3, 3, 4, 3, '演示状态为暂时关闭。', '2026-08-15T08:10:00+08:00')]
  },
  {
    id: 'ss-demo-007', name: '红门路公共卫生间（演示）', region: '荆州市·沙市中心区',
    latitude: 30.324, longitude: 112.2538, coordinateSystem: 'GCJ-02-DEMO',
    address: '沙市中心区演示点 G', entranceDescription: '从街角便民驿站右侧通道进入，入口朝向南侧。',
    floor: '地面层', openingHours: '06:30–22:00', status: 'open', feeType: 'free',
    facilities: ['seated', 'toilet-paper', 'hand-wash'], lastVerifiedAt: '2026-08-11T10:40:00+08:00',
    dataSource: '演示数据', isDemo: true,
    seedReviews: [makeReview('seed-008', 4, 4, 4, 5, '设备标签清楚。', '2026-08-11T10:40:00+08:00')]
  },
  {
    id: 'ss-demo-008', name: '塔桥路公共卫生间（演示）', region: '荆州市·沙市中心区',
    latitude: 30.3188, longitude: 112.2383, coordinateSystem: 'GCJ-02-DEMO',
    address: '沙市中心区演示点 H', entranceDescription: '沿塔桥路步行至演示导视牌，入口位于建筑北侧外墙。',
    floor: '地面层', openingHours: '06:00–22:00', status: 'uncertain', feeType: 'free',
    facilities: ['accessible', 'hand-wash'], lastVerifiedAt: '2026-07-25T14:30:00+08:00',
    dataSource: '演示数据', isDemo: true,
    seedReviews: [makeReview('seed-009', 4, 3, 4, 4, '最近确认时间较早。', '2026-07-25T14:30:00+08:00')]
  }
])
