import os
import subprocess
import uuid

GIF_HOME = '/datadrive/flashgo/gif/'


class GifGenerator(object):
    """
    generate gif from video
    """

    def __init__(self, video_path, *, delete_video=False, from_pos=0, to_pos=1, max_size=200 * 1024, delete_gif=True):
        self._video_path = video_path
        self._delete_video = delete_video
        self._delete_gif = delete_gif
        self._gif_path = GIF_HOME + '/' + str(uuid.uuid4()) + '.gif'
        self._from_pos = from_pos
        self._to_pos = to_pos
        self._max_size = max_size

    def __enter__(self):
        try:
            assert os.path.exists(self._video_path), 'video do not exists'
            command = 'gifify %s -o %s  --compress 100  --from %s --to %s --fps=5' % (self._video_path,
                                                                                      self._gif_path,
                                                                                      self._from_pos,
                                                                                      self._to_pos)
            process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
            process.wait()
            if process.returncode == 0 and 0 < os.path.getsize(self._gif_path) < self._max_size:
                return self._gif_path
            else:
                raise ValueError('gif do not generate or gif is too large(return code is %s)' % process.returncode)
        except:
            self.__exit__()
            raise

    def __exit__(self, *args):
        if self._delete_gif:
            os.remove(self._gif_path)
        if self._delete_video:
            os.remove(self._video_path)


def main():
    process = subprocess.Popen(
        'curl https://cdn.flashgo.online/news-video/f0d926e1-3317-463b-bbec-d1532abba2c8 > %s/100549084.mp4' % GIF_HOME,
        shell=True,
        stdout=subprocess.PIPE)
    process.wait()
    with GifGenerator(GIF_HOME + '/100549084.mp4', delete_gif=True, delete_video=True) as gif_path:
        print(gif_path)
        assert 0 < os.path.getsize(gif_path) < 1024 * 1024


if __name__ == '__main__':
    main()
