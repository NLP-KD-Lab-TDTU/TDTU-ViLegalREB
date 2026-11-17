export interface BenchmarkCategoryDef {
  key: string;
  short: string;
  queries: number;
}

// All 27 official benchmark categories from queries.json and metrics.json (sorted by query volume)
export const BENCHMARK_CATEGORIES: BenchmarkCategoryDef[] = [
  { key: 'Chứng thực', short: 'Chứng thực', queries: 18 },
  { key: 'Hộ tịch', short: 'Hộ tịch', queries: 15 },
  { key: 'Hôn nhân gia đình', short: 'Hôn nhân GĐ', queries: 14 },
  { key: 'Công chứng', short: 'Công chứng', queries: 12 },
  { key: 'Dân sự', short: 'Dân sự', queries: 10 },
  { key: 'Giao dịch đảm bảo', short: 'GD Đảm bảo', queries: 7 },
  { key: 'Văn hóa, thể thao, du lịch', short: 'Văn hóa & DL', queries: 7 },
  { key: 'Cư trú', short: 'Cư trú', queries: 6 },
  { key: 'Xây dựng, nhà ở, đô thị', short: 'Xây dựng', queries: 6 },
  { key: 'Lao động', short: 'Lao động', queries: 5 },
  { key: 'Con nuôi', short: 'Con nuôi', queries: 4 },
  { key: 'Thương mại, đầu tư, chứng khoán', short: 'Đầu tư & CK', queries: 4 },
  { key: 'Đấu giá tài sản', short: 'Đấu giá', queries: 4 },
  { key: 'Doanh nghiệp, hợp tác xã', short: 'Doanh nghiệp', queries: 4 },
  { key: 'Hình sự', short: 'Hình sự', queries: 4 },
  { key: 'Đất đai', short: 'Đất đai', queries: 3 },
  { key: 'Chính sách xã hội', short: 'CS Xã hội', queries: 3 },
  { key: 'Lĩnh vực khác', short: 'Lĩnh vực khác', queries: 3 },
  { key: 'Lý lịch tư pháp', short: 'Lý lịch TP', queries: 2 },
  { key: 'Giám định tư pháp', short: 'Giám định', queries: 2 },
  { key: 'Quốc tịch', short: 'Quốc tịch', queries: 2 },
  { key: 'Các lĩnh vực khác', short: 'Lĩnh vực khác 2', queries: 2 },
  { key: 'Hành chính', short: 'Hành chính', queries: 2 },
  { key: 'Hành chính tư pháp', short: 'HC Tư pháp', queries: 1 },
  { key: 'Bồi thường nhà nước', short: 'Bồi thường NN', queries: 1 },
  { key: 'An ninh quốc gia', short: 'An ninh QG', queries: 1 },
  { key: 'Thương mại', short: 'Thương mại', queries: 1 },
];

export const TOTAL_BENCHMARK_QUERIES = BENCHMARK_CATEGORIES.reduce(
  (sum, cat) => sum + cat.queries,
  0
);
