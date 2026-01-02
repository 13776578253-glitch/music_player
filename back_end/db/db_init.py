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
    await db_operations.ModelTable.create_table()
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

async def init_rigorous_play_events():
    """生成严谨的有规律播放事件数据集"""
    
    # 严谨的用户偏好模型
    user_preferences = {
        1: {
            'fav_genres': ['pop', 'rock'],
            'fav_languages': ['Japanese', 'English'],
            'fav_duration_range': (180, 280),
            'complete_probability': 0.85,  # 喜欢时完成概率
            'skip_probability': 0.05       # 喜欢时跳过概率
        },
        2: {
            'fav_genres': ['electronic', 'hip-hop'],
            'fav_languages': ['Korean', 'English'],
            'fav_duration_range': (150, 220),
            'complete_probability': 0.80,
            'skip_probability': 0.10
        },
        3: {
            'fav_genres': ['folk', 'ballad'],
            'fav_languages': ['Chinese', 'Japanese'],
            'fav_duration_range': (200, 320),
            'complete_probability': 0.90,
            'skip_probability': 0.03
        },
        4: {
            'fav_genres': ['rock', 'pop'],
            'fav_languages': ['Japanese', 'Korean'],
            'fav_duration_range': (210, 300),
            'complete_probability': 0.82,
            'skip_probability': 0.08
        },
        5: {
            'fav_genres': ['pop', 'electronic'],
            'fav_languages': ['English', 'Korean'],
            'fav_duration_range': (160, 240),
            'complete_probability': 0.78,
            'skip_probability': 0.12
        },
        6: {
            'fav_genres': ['folk', 'pop'],
            'fav_languages': ['Chinese', 'Japanese'],
            'fav_duration_range': (220, 330),
            'complete_probability': 0.88,
            'skip_probability': 0.04
        },
        7: {
            'fav_genres': ['hip-hop', 'electronic'],
            'fav_languages': ['Korean', 'English'],
            'fav_duration_range': (140, 210),
            'complete_probability': 0.75,
            'skip_probability': 0.15
        },
        8: {
            'fav_genres': ['rock', 'ballad'],
            'fav_languages': ['Japanese', 'Chinese'],
            'fav_duration_range': (230, 310),
            'complete_probability': 0.86,
            'skip_probability': 0.06
        },
        9: {
            'fav_genres': ['pop', 'folk'],
            'fav_languages': ['English', 'Chinese'],
            'fav_duration_range': (190, 270),
            'complete_probability': 0.83,
            'skip_probability': 0.07
        },
        10: {
            'fav_genres': ['electronic', 'rock'],
            'fav_languages': ['Korean', 'Japanese'],
            'fav_duration_range': (170, 250),
            'complete_probability': 0.81,
            'skip_probability': 0.09
        }
    }
    
    # 歌曲分类（基于49首歌）
    songs_by_category = {
        # Category 1: Japanese pop/rock (适合用户1,4,8,10)
        'japanese_pop_rock': [1, 2, 6, 7, 9, 10, 14, 17, 18, 19, 21, 24, 28, 29],
        
        # Category 2: Korean/English pop/hip-hop (适合用户2,5,7)
        'korean_english': [31, 32, 33, 34, 35, 36, 37, 38],
        
        # Category 3: Chinese folk/pop (适合用户3,6,9)
        'chinese': [39, 40, 41, 42, 44, 45, 46, 47, 48, 49],
        
        # Category 4: Japanese electronic/ballad (中等偏好)
        'japanese_other': [3, 4, 5, 8, 11, 12, 13, 15, 16, 20, 22, 23, 25, 26, 27, 30],
        
        # Category 5: 不匹配的歌曲（用于负样本）
        'mismatch': [5, 27, 30, 34, 43]  # 这些歌曲与大部分用户偏好不匹配
    }
    
    # 歌曲详细信息
    song_details = {}
    # 这里应该填充49首歌的详细信息，为简化，我创建一些基本数据
    for i in range(1, 50):
        # 分配流派和语言
        if i in songs_by_category['japanese_pop_rock']:
            genre = 'pop' if i % 2 == 0 else 'rock'
            language = 'Japanese'
            duration = random.randint(180, 280)
        elif i in songs_by_category['korean_english']:
            genre = 'pop' if i < 35 else 'hip-hop'
            language = 'Korean' if i % 2 == 0 else 'English'
            duration = random.randint(150, 220)
        elif i in songs_by_category['chinese']:
            genre = 'folk' if i in [41, 49] else 'pop'
            language = 'Chinese'
            duration = random.randint(200, 320)
        elif i in songs_by_category['japanese_other']:
            genre = random.choice(['electronic', 'ballad', 'folk'])
            language = 'Japanese'
            duration = random.randint(190, 300)
        else:
            genre = random.choice(['folk', 'electronic', 'hip-hop'])
            language = random.choice(['Instrumental', 'Chinese', 'Japanese'])
            duration = random.randint(150, 330)
        
        song_details[i] = {
            'genre': genre,
            'language': language,
            'duration': duration
        }
    
    events = []
    
    # 为每个用户生成20个事件（总共200个）
    for user_id in range(1, 11):
        user_pref = user_preferences[user_id]
        
        # 确定用户对各类歌曲的偏好程度
        pref_levels = {
            'fav_category': 0.6,    # 最喜欢类别占比
            'medium_category': 0.3,  # 中等喜欢类别占比
            'mismatch_category': 0.1 # 不匹配类别占比
        }
        
        # 确定用户的偏好歌曲类别
        if user_id in [1, 4, 8, 10]:
            fav_category = 'japanese_pop_rock'
            medium_category = 'japanese_other'
        elif user_id in [2, 5, 7]:
            fav_category = 'korean_english'
            medium_category = 'japanese_other'
        elif user_id in [3, 6, 9]:
            fav_category = 'chinese'
            medium_category = 'japanese_other'
        else:
            fav_category = 'japanese_pop_rock'
            medium_category = 'chinese'
        
        # 为当前用户生成20个事件
        for i in range(20):
            # 根据偏好选择歌曲类别
            rand_val = random.random()
            if rand_val < pref_levels['fav_category']:
                # 最喜欢类别
                category = fav_category
                song_id = random.choice(songs_by_category[category])
                song_info = song_details[song_id]
                
                # 检查是否符合用户具体偏好
                genre_match = song_info['genre'] in user_pref['fav_genres']
                lang_match = song_info['language'] in user_pref['fav_languages']
                duration_match = user_pref['fav_duration_range'][0] <= song_info['duration'] <= user_pref['fav_duration_range'][1]
                
                # 决定事件类型
                if genre_match and lang_match and duration_match:
                    # 完全匹配，大概率完成
                    if random.random() < user_pref['complete_probability']:
                        event_type = 'complete'
                        position = song_info['duration']
                    else:
                        event_type = 'skip'
                        position = random.randint(10, song_info['duration'] // 4)
                else:
                    # 部分匹配，中等概率完成
                    complete_prob = user_pref['complete_probability'] * 0.7
                    if random.random() < complete_prob:
                        event_type = 'complete'
                        position = song_info['duration']
                    else:
                        event_type = random.choice(['skip', 'pause'])
                        if event_type == 'skip':
                            position = random.randint(10, song_info['duration'] // 3)
                        else:
                            position = random.randint(song_info['duration'] // 3, song_info['duration'] * 2 // 3)
            
            elif rand_val < pref_levels['fav_category'] + pref_levels['medium_category']:
                # 中等喜欢类别
                category = medium_category
                song_id = random.choice(songs_by_category[category])
                song_info = song_details[song_id]
                
                # 中等概率完成
                complete_prob = user_pref['complete_probability'] * 0.5
                if random.random() < complete_prob:
                    event_type = 'complete'
                    position = song_info['duration']
                else:
                    event_type = random.choice(['skip', 'pause', 'stop'])
                    if event_type == 'skip':
                        position = random.randint(10, song_info['duration'] // 3)
                    else:
                        position = random.randint(song_info['duration'] // 3, song_info['duration'] * 2 // 3)
            
            else:
                # 不匹配类别
                category = 'mismatch'
                song_id = random.choice(songs_by_category[category])
                song_info = song_details[song_id]
                
                # 低概率完成
                complete_prob = user_pref['complete_probability'] * 0.2
                if random.random() < complete_prob:
                    event_type = 'complete'
                    position = song_info['duration']
                else:
                    event_type = random.choice(['skip', 'stop'])
                    if event_type == 'skip':
                        position = random.randint(10, song_info['duration'] // 5)  # 很早跳过
                    else:
                        position = random.randint(song_info['duration'] // 4, song_info['duration'] // 2)
            
            # 创建事件
            events.append({
                'user_id': user_id,
                'song_id': song_id,
                'event_type': event_type,
                'position': position,
                'duration': song_info['duration']
            })
    
    # 验证数据规律性
    print("数据验证：")
    
    # 1. 检查事件类型分布
    event_counts = {}
    for event in events:
        event_counts[event['event_type']] = event_counts.get(event['event_type'], 0) + 1
    
    print(f"事件类型分布: {event_counts}")
    
    # 2. 检查用户行为一致性
    print("\n用户行为统计:")
    for user_id in range(1, 6):  # 显示前5个用户
        user_events = [e for e in events if e['user_id'] == user_id]
        completes = len([e for e in user_events if e['event_type'] == 'complete'])
        skips = len([e for e in user_events if e['event_type'] == 'skip'])
        print(f"用户{user_id}: 完成率={completes/len(user_events):.2f}, 跳过率={skips/len(user_events):.2f}")
    
    # 3. 检查歌曲偏好模式
    print("\n歌曲类别偏好验证:")
    for category in songs_by_category.keys():
        cat_events = [e for e in events if e['song_id'] in songs_by_category[category]]
        if cat_events:
            complete_rate = len([e for e in cat_events if e['event_type'] == 'complete']) / len(cat_events)
            print(f"{category}: {len(cat_events)}次播放, 完成率={complete_rate:.2f}")
    
    # 插入数据
    for event in events:
        await db_operations.PlayEventTable.add_play_event(
            event['user_id'],
            event['song_id'],
            'play',
            event['position'],
            event['duration']
        )
        await db_operations.PlayEventTable.add_play_event(
            event['user_id'],
            event['song_id'],
            event['event_type'],
            event['position'],
            event['duration']
        )
    
    print(f"\n已生成{len(events)}个播放事件")
    return events

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
    # await init_play_event()
    await init_rigorous_play_events()
    await init_user_playlist()
    logger.info('=====================数据初始化=====================\n')


if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    asyncio.run(init_all_data())