import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:{default:'Link Me — Trần Trung Dũng',template:'%s · Link Me'},description:'Portfolio của Trần Trung Dũng, sinh viên CNTT K23D. Hồ sơ, kỹ năng và dự án.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="vi"><body>{children}</body></html>;}
