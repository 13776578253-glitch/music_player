import logging
from db import db_operations

logger = logging.getLogger("db")

# 初始化所有表的入口函数
async def init_all_tables():
    await db_operations.SongTable.create_table()
    await db_operations.UserTable.create_table()
    await db_operations.PlaylistTable.create_table()
    await db_operations.UserPlaylistTable.create_table()
    await db_operations.PlaylistSongTable.create_table()
    await db_operations.PlayEventTable.create_table()
    await db_operations.SongStatsTable.create_table()
    await db_operations.UserModelTable.create_table()
    logger.info("所有数据库表初始化完成！")

# 10
async def init_user():
    await db_operations.UserTable.add_user('cqy', '123456')
    await db_operations.UserTable.add_user('cpp', '654321')
    await db_operations.UserTable.add_user('alice', 'alice123')
    await db_operations.UserTable.add_user('bob', 'bob@456')
    await db_operations.UserTable.add_user('charlie', 'charlie789')
    await db_operations.UserTable.add_user('david', 'david_2023')
    await db_operations.UserTable.add_user('eve', 'eve!secure')
    await db_operations.UserTable.add_user('frank', 'frank#pass')
    await db_operations.UserTable.add_user('grace', 'grace$word')
    await db_operations.UserTable.add_user('henry', 'henry%1234')
    logger.info("所有user数据初始化完成！")

# 49
lyrics1 = """彷徨い - 花譜
词：カンザキイオリ
曲：カンザキイオリ
编曲：カンザキイオリ
一歩一歩が足の裏を劈いて
鈍感な心も
跳ね上がって過呼吸気味
「もう僕を守るものは
ないけれど」
続きは出てこない
情景に彷徨い
どうしても肌をすり抜ける全てに
どうしても別れを言えなかった
新しいこと始める度に
内心誰かが邪魔をする
電車の中じゃ大人たちは
スマホに夢中なのに
「誰も僕を止められない
止めるのは僕自身だ」
そう俯き呟いた
後悔に彷徨い
どうしても知れないことがある
どうしてもうまく呼吸ができない
リュックサックに詰めた
ハリボテの双眼鏡
彷徨い歩く僕ら何が見えるかな
スニーカーを買い替えて
長い髪もバッサリ切った
ショートカットで見る世界は
何故か妙に色彩が綺麗で
思わず口から出た
「もう僕を守るものは
ないけれど」
「それでもいい
傷ついた過去があるから」
どうしても別れを言えなかった
どうしても上手く涙が出せない
旅立つ僕にはどうにも言えない
霞んで頭を彷徨う
さよならが言えなかった
知らない街ばかりになって
埃が目の中に入って
ささくれがまた痛み出して
心細くなって
陽の明かりが邪魔をする
ポケットのチョコレートは
無くなって
不安ばかりが連なった
電車を降りたら知らない世界で
「それでもいい
寂しさは思い出となるから」
変わりゆく自分に
まだ初めましてが言えない
運命を妄想と呼んで
別れを悪戯と笑った
培った人生を置いて
見たいものを見るんだ
スニーカーも長い髪も
自分さえ不確かなままで
何と出会うかな
生涯を流離い 永遠を彷徨い
どうしても世界を見たかった
どうしても世界を知りたかった"""
async def init_song():
    await db_operations.SongTable.add_song('彷徨い', ['花譜'], '/music_player/front_end/assets/music/1.mp3', album='魔法β', lyricist='カンザキイオリ', lyrics=lyrics1, composer='カンザキイオリ', language='Japanese', genre='pop', duration=262)
    await db_operations.SongTable.add_song('メルの黄昏', ['花譜'], '/music_player/front_end/assets/music/2.mp3', album='魔法β', lyricist='カンザキイオリ', composer='カンザキイオリ', language='Japanese', genre='pop', duration=235)
    await db_operations.SongTable.add_song('不可逆リプレイス', ['花譜'], '/music_player/front_end/assets/music/3.mp3', album='魔法γ', lyricist='カンザキイオリ', composer='カンザキイオリ', language='Japanese', genre='electronic', duration=247)
    await db_operations.SongTable.add_song('夜行', ['花譜'], '/music_player/front_end/assets/music/4.mp3', album='魔法γ', lyricist='カンザキイオリ', composer='カンザキイオリ', language='Japanese', genre='ballad', duration=252)
    await db_operations.SongTable.add_song('糸', ['花譜'], '/music_player/front_end/assets/music/5.mp3', album='観測', lyricist='中島みゆき', composer='中島みゆき', language='Japanese', genre='folk', duration=328)
    await db_operations.SongTable.add_song('夜に駆ける', ['YOASOBI'], '/music_player/front_end/assets/music/6.mp3', album='THE BOOK', lyricist='Ayase', composer='Ayase', language='Japanese', genre='pop', duration=242)
    await db_operations.SongTable.add_song('群青', ['YOASOBI'], '/music_player/front_end/assets/music/7.mp3', album='THE BOOK', lyricist='Ayase', composer='Ayase', language='Japanese', genre='rock', duration=268)
    await db_operations.SongTable.add_song('怪物', ['YOASOBI'], '/music_player/front_end/assets/music/8.mp3', album='THE BOOK 2', lyricist='Ayase', composer='Ayase', language='Japanese', genre='electronic', duration=235)
    await db_operations.SongTable.add_song('アイドル', ['YOASOBI'], '/music_player/front_end/assets/music/9.mp3', album='アイドル', lyricist='Ayase', composer='Ayase', language='Japanese', genre='pop', duration=213)
    await db_operations.SongTable.add_song('Lemon', ['米津玄師'], '/music_player/front_end/assets/music/10.mp3', album='BOOTLEG', lyricist='米津玄師', composer='米津玄師', language='Japanese', genre='pop', duration=263)
    await db_operations.SongTable.add_song('打上花火', ['DAOKO', '米津玄師'], '/music_player/front_end/assets/music/11.mp3', album='打上花火', lyricist='米津玄師', composer='米津玄師', language='Japanese', genre='pop', duration=276)
    await db_operations.SongTable.add_song('Pretender', ['Official髭男dism'], '/music_player/front_end/assets/music/12.mp3', album='Traveler', lyricist='藤原聡', composer='藤原聡', language='Japanese', genre='pop', duration=328)
    await db_operations.SongTable.add_song('I LOVE...', ['Official髭男dism'], '/music_player/front_end/assets/music/13.mp3', album='Editorial', lyricist='藤原聡', composer='藤原聡', language='Japanese', genre='pop', duration=244)
    await db_operations.SongTable.add_song('Subtitle', ['Official髭男dism'], '/music_player/front_end/assets/music/14.mp3', album='Editorial', lyricist='藤原聡', composer='藤原聡', language='Japanese', genre='rock', duration=304)
    await db_operations.SongTable.add_song('Cry Baby', ['Official髭男dism'], '/music_player/front_end/assets/music/15.mp3', album='Editorial', lyricist='藤原聡', composer='藤原聡', language='Japanese', genre='ballad', duration=253)
    await db_operations.SongTable.add_song('ヨワネハキ', ['mafumafu'], '/music_player/front_end/assets/music/16.mp3', album='ワンス・アポン・ア・ドリーム', lyricist='mafumafu', composer='mafumafu', language='Japanese', genre='rock', duration=217)
    await db_operations.SongTable.add_song('新時代', ['Ado'], '/music_player/front_end/assets/music/17.mp3', album='ウタの歌', lyricist='中田ヤスタカ', composer='中田ヤスタカ', language='Japanese', genre='pop', duration=225)
    await db_operations.SongTable.add_song('ギラギラ', ['Ado'], '/music_player/front_end/assets/music/18.mp3', album='ウタの歌 ONE PIECE FILM RED', lyricist='中田ヤスタカ', composer='中田ヤスタカ', language='Japanese', genre='rock', duration=209)
    await db_operations.SongTable.add_song('Dune', ['砂原良徳'], '/music_player/front_end/assets/music/19.mp3', album='DUNE', lyricist='砂原良徳', composer='砂原良徳', language='Instrumental', genre='electronic', duration=218)
    await db_operations.SongTable.add_song('Butter', ['BTS'], '/music_player/front_end/assets/music/20.mp3', album='Butter', lyricist='RM', composer='RM', language='Korean', genre='pop', duration=164)
    await db_operations.SongTable.add_song('Dynamite', ['BTS'], '/music_player/front_end/assets/music/21.mp3', album='BE', lyricist='David Stewart', composer='David Stewart', language='English', genre='pop', duration=199)
    await db_operations.SongTable.add_song('Kill This Love', ['BLACKPINK'], '/music_player/front_end/assets/music/22.mp3', album='Kill This Love', lyricist='TEDDY', composer='TEDDY', language='Korean', genre='pop', duration=189)
    await db_operations.SongTable.add_song('How You Like That', ['BLACKPINK'], '/music_player/front_end/assets/music/23.mp3', album='THE ALBUM', lyricist='TEDDY', composer='TEDDY', language='Korean', genre='hip-hop', duration=182)
    await db_operations.SongTable.add_song('Pink Venom', ['BLACKPINK'], '/music_player/front_end/assets/music/24.mp3', album='BORN PINK', lyricist='TEDDY', composer='TEDDY', language='Korean', genre='hip-hop', duration=185)
    await db_operations.SongTable.add_song('Stay', ['The Kid LAROI', 'Justin Bieber'], '/music_player/front_end/assets/music/25.mp3', album='F*CK LOVE 3', lyricist='The Kid LAROI', composer='The Kid LAROI', language='English', genre='pop', duration=141)
    await db_operations.SongTable.add_song('Blinding Lights', ['The Weeknd'], '/music_player/front_end/assets/music/26.mp3', album='After Hours', lyricist='The Weeknd', composer='The Weeknd', language='English', genre='pop', duration=200)
    await db_operations.SongTable.add_song('Shape of You', ['Ed Sheeran'], '/music_player/front_end/assets/music/27.mp3', album='÷', lyricist='Ed Sheeran', composer='Ed Sheeran', language='English', genre='pop', duration=233)
    await db_operations.SongTable.add_song('Bad Guy', ['Billie Eilish'], '/music_player/front_end/assets/music/28.mp3', album='WHEN WE ALL FALL ASLEEP', lyricist='Billie Eilish', composer='Billie Eilish', language='English', genre='pop', duration=194)
    await db_operations.SongTable.add_song('告白气球', ['周杰伦'], '/music_player/front_end/assets/music/29.mp3', album='周杰伦的床边故事', lyricist='方文山', composer='周杰伦', language='Chinese', genre='pop', duration=215)
    await db_operations.SongTable.add_song('七里香', ['周杰伦'], '/music_player/front_end/assets/music/30.mp3', album='七里香', lyricist='方文山', composer='周杰伦', language='Chinese', genre='pop', duration=298)
    await db_operations.SongTable.add_song('青花瓷', ['周杰伦'], '/music_player/front_end/assets/music/31.mp3', album='我很忙', lyricist='方文山', composer='周杰伦', language='Chinese', genre='folk', duration=239)
    await db_operations.SongTable.add_song('晴天', ['周杰伦'], '/music_player/front_end/assets/music/32.mp3', album='叶惠美', lyricist='周杰伦', composer='周杰伦', language='Chinese', genre='pop', duration=269)
    await db_operations.SongTable.add_song('夜曲', ['周杰伦'], '/music_player/front_end/assets/music/33.mp3', album='十一月的萧邦', lyricist='方文山', composer='周杰伦', language='Chinese', genre='hip-hop', duration=215)
    await db_operations.SongTable.add_song('小幸运', ['田馥甄'], '/music_player/front_end/assets/music/34.mp3', album='小幸运', lyricist='徐世珍', composer='JerryC', language='Chinese', genre='pop', duration=277)
    await db_operations.SongTable.add_song('说散就散', ['陈泳彤'], '/music_player/front_end/assets/music/35.mp3', album='说散就散', lyricist='张楚翘', composer='伍乐城', language='Chinese', genre='pop', duration=229)
    await db_operations.SongTable.add_song('光年之外', ['邓紫棋'], '/music_player/front_end/assets/music/36.mp3', album='另一个童话', lyricist='G.E.M.邓紫棋', composer='G.E.M.邓紫棋', language='Chinese', genre='pop', duration=235)
    await db_operations.SongTable.add_song('泡沫', ['邓紫棋'], '/music_player/front_end/assets/music/37.mp3', album='Xposed', lyricist='G.E.M.邓紫棋', composer='G.E.M.邓紫棋', language='Chinese', genre='pop', duration=257)
    await db_operations.SongTable.add_song('演员', ['薛之谦'], '/music_player/front_end/assets/music/38.mp3', album='初学者', lyricist='薛之谦', composer='薛之谦', language='Chinese', genre='pop', duration=267)
    await db_operations.SongTable.add_song('丑八怪', ['薛之谦'], '/music_player/front_end/assets/music/39.mp3', album='意外', lyricist='甘世佳', composer='李荣浩', language='Chinese', genre='pop', duration=234)
    await db_operations.SongTable.add_song('平凡之路', ['朴树'], '/music_player/front_end/assets/music/40.mp3', album='猎户星座', lyricist='朴树', composer='朴树', language='Chinese', genre='folk', duration=317)
    await db_operations.SongTable.add_song('花に亡霊', ['ヨルシカ'], '/music_player/front_end/assets/music/41.mp3', album='エルマ', lyricist='n-buna', composer='n-buna', language='Japanese', genre='pop', duration=241)
    await db_operations.SongTable.add_song('夜行', ['ヨルシカ'], '/music_player/front_end/assets/music/42.mp3', album='負け犬にアンコールはいらない', lyricist='n-buna', composer='n-buna', language='Japanese', genre='rock', duration=238)
    await db_operations.SongTable.add_song('爆弾魔', ['ヨルシカ'], '/music_player/front_end/assets/music/43.mp3', album='盗作', lyricist='n-buna', composer='n-buna', language='Japanese', genre='electronic', duration=202)
    await db_operations.SongTable.add_song('左右盲', ['ヨルシカ'], '/music_player/front_end/assets/music/44.mp3', album='負け犬にアンコールはいらない', lyricist='n-buna', composer='n-buna', language='Japanese', genre='pop', duration=226)
    await db_operations.SongTable.add_song('嘘月', ['ヨルシカ'], '/music_player/front_end/assets/music/45.mp3', album='幻燈', lyricist='n-buna', composer='n-buna', language='Japanese', genre='ballad', duration=257)
    await db_operations.SongTable.add_song('バグ', ['理芽'], '/music_player/front_end/assets/music/46.mp3', album='ALIEN', lyricist='カンザキイオリ', composer='カンザキイオリ', language='Japanese', genre='electronic', duration=197)
    await db_operations.SongTable.add_song('脳裏上のクラッカー', ['理芽'], '/music_player/front_end/assets/music/47.mp3', album='ALIEN', lyricist='カンザキイオリ', composer='カンザキイオリ', language='Japanese', genre='pop', duration=214)
    await db_operations.SongTable.add_song('アブノーマリティ・ダンシンガール', ['理芽'], '/music_player/front_end/assets/music/48.mp3', album='ALIEN', lyricist='カンザキイオリ', composer='カンザキイオリ', language='Japanese', genre='rock', duration=189)
    await db_operations.SongTable.add_song('気まぐれメルシィ', ['理芽'], '/music_player/front_end/assets/music/49.mp3', album='ALIEN', lyricist='カンザキイオリ', composer='カンザキイオリ', language='Japanese', genre='pop', duration=203)
    logger.info("所有song数据初始化完成！")

async def init_playlist():
    await db_operations.PlaylistTable.add_playlist(1, '我的歌单', 'private')
    await db_operations.PlaylistTable.add_playlist(1, '我的公共歌单', 'public')
    await db_operations.PlaylistTable.add_playlist(2, '开车音乐', 'public')
    await db_operations.PlaylistTable.add_playlist(3, '工作专注', 'private')
    await db_operations.PlaylistTable.add_playlist(4, '运动歌单', 'public')
    await db_operations.PlaylistTable.add_playlist(5, '日语精选', 'private')
    await db_operations.PlaylistTable.add_playlist(6, '睡前放松', 'private')
    await db_operations.PlaylistTable.add_playlist(7, '经典老歌', 'public')
    await db_operations.PlaylistTable.add_playlist(8, '学习背景音', 'public')
    await db_operations.PlaylistTable.add_playlist(9, '聚会嗨歌', 'public')
    await db_operations.PlaylistTable.add_playlist(10, '纯音乐', 'private')
    logger.info("所有playlist数据初始化完成！")

# async def init_play_event():
#     await db_operations.PlayEventTable.add_play_event()
    
# async def init_user_playlist(): 
#     await db_operations.UserPlaylistTable.add_user_playlist()

import random
async def init_play_event():
    # 生成160个播放事件，skip和complete占80%，play事件占15%
    # skip和complete
    for i in range(128):
        user_id = random.randint(1, 10)
        song_id = random.randint(1, 49)
        event_type = random.choice(['skip', 'complete'])
        duration = random.randint(180, 350)
        
        if event_type == 'complete':
            position = duration  # 播放完成
        else:  # skip
            position = random.randint(10, duration // 2)  # 跳过时位置在歌曲前半段
        
        await db_operations.PlayEventTable.add_play_event(user_id, song_id, event_type, position, duration)
    
    # play事件
    for i in range(24):
        user_id = random.randint(1, 10)
        song_id = random.randint(1, 49)
        event_type = 'play'
        duration = random.randint(180, 350)
        position = 0  # 开始播放
        await db_operations.PlayEventTable.add_play_event(user_id, song_id, event_type, position, duration)
    
    # pause/stop事件
    for i in range(8):
        user_id = random.randint(1, 10)
        song_id = random.randint(1, 49)
        event_type = random.choice(['pause', 'stop'])
        duration = random.randint(180, 350)
        position = random.randint(30, duration // 2)  # 随机位置暂停或停止
        await db_operations.PlayEventTable.add_play_event(user_id, song_id, event_type, position, duration)
    
    logger.info("所有个播放事件数据初始化完成！")

async def init_user_playlist():
    # 生成30个用户-歌单关系数据
    # 已有的21个歌单中，1-10号是用户的"喜欢"歌单，11-21是其他歌单
    user_playlist_pairs = []
    # 策略：每个用户收藏其他用户的歌单，不收藏自己的
    # 用户ID 1-10对应"喜欢"歌单ID 1-10
    # 1. 首先确保每个用户都收藏几个非自己的"喜欢"歌单（5-8个关系）
    for user_id in range(1, 11):
        # 可以收藏2-4个其他用户的"喜欢"歌单
        num_favorites = random.randint(2, 4)
        favorite_playlists = random.sample([pid for pid in range(1, 11) if pid != user_id], num_favorites)
        
        for playlist_id in favorite_playlists:
            user_playlist_pairs.append((user_id, playlist_id))
    
    # 2. 收藏一些公共歌单（ID 11-21）
    for user_id in range(1, 11):
        # 每个用户收藏1-3个公共歌单
        num_public = random.randint(1, 3)
        public_playlists = random.sample(range(11, 22), min(num_public, 11))
        
        for playlist_id in public_playlists:
            user_playlist_pairs.append((user_id, playlist_id))
    
    # 3. 如果数量不足30，再添加一些随机关系
    while len(user_playlist_pairs) < 30:
        user_id = random.randint(1, 10)
        # 排除用户自己的"喜欢"歌单
        if random.random() < 0.3:
            # 收藏其他用户的"喜欢"歌单
            playlist_id = random.choice([pid for pid in range(1, 11) if pid != user_id])
        else:
            # 收藏公共歌单
            playlist_id = random.randint(11, 21)
        
        if (user_id, playlist_id) not in user_playlist_pairs:
            user_playlist_pairs.append((user_id, playlist_id))
    
    # 随机选取30个关系
    if len(user_playlist_pairs) > 30:
        user_playlist_pairs = random.sample(user_playlist_pairs, 30)
    
    # 插入数据
    for user_id, playlist_id in user_playlist_pairs:
        await db_operations.UserPlaylistTable.add_user_playlist(user_id, playlist_id)
    
    logger.info(f"所有用户-歌单关系数据初始化完成！")

async def init_all_data():
    logger.info('=====================数据初始化=====================')
    await init_all_tables()
    await init_user()
    await init_song()
    await init_playlist()
    await init_play_event()
    await init_user_playlist()
    logger.info('=====================数据初始化=====================\n')


if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    asyncio.run(init_all_data())